//user challenge management: handle users participation and progress in challenges
const UserChallenge = require('../models/UserChallenge.model');
const Challenge = require('../models/Challenge.model');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../errors/AppError');

const getUserChallenges = async (req, res, next) => {
  try {
    const userChallenges = await UserChallenge.find({
      user: req.userId,
      status: 'active'
    })
      .populate('challenge', 'title description activities startDate endDate creator participants')
      .populate('challenge.creator', 'name email')
      .sort({ joinedAt: -1 })
      .lean();

    res.json(userChallenges);
  } catch (error) {
    logger.error('getUserChallenges error', { error, message: error.message });
    next(error);
  }
};

//get all user challenges
const getAllUserChallenges = async (req, res, next) => {
  try {
    const userChallenges = await UserChallenge.find({
      user: req.userId
    })
      .populate('challenge', 'title description activities startDate endDate creator participants')
      .populate('challenge.creator', 'name email')
      .sort({ joinedAt: -1 })
      .lean();

    res.json(userChallenges);
  } catch (error) {
    logger.error('getAllUserChallenges error', { error, message: error.message });
    next(error);
  }
};

const joinChallenge = async (req, res, next) => {
  try {
    const { challengeId } = req.params;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    const existingUserChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    });

    //if exists and is active, return it
    if (existingUserChallenge && existingUserChallenge.status === 'active') {
      await existingUserChallenge.populate('challenge', 'title description activities startDate endDate creator');
      await existingUserChallenge.populate('challenge.creator', 'name email');

      return res.status(200).json({
        message: 'Already participating in this challenge',
        userChallenge: existingUserChallenge,
        alreadyJoined: true
      });
    }

    //if exists but was abandoned, reactivate it
    if (existingUserChallenge && existingUserChallenge.status === 'abandoned') {
      const activitiesProgress = challenge.activities.map(activity => ({
        activityId: activity.name,
        progress: 0,
        lastUpdated: new Date()
      }));

      existingUserChallenge.status = 'active';
      existingUserChallenge.activitiesProgress = activitiesProgress;
      existingUserChallenge.completedAt = undefined;
      existingUserChallenge.joinedAt = new Date();

      await existingUserChallenge.save();

      if (!challenge.participants.includes(req.userId)) {
        challenge.participants.push(req.userId);
        await challenge.save();
      }

      await existingUserChallenge.populate('challenge', 'title description activities startDate endDate creator');
      await existingUserChallenge.populate('challenge.creator', 'name email');

      logger.info(`userChallenge:rejoin user=${req.userId} challenge=${challengeId}`);

      return res.status(200).json({
        message: 'Rejoined challenge',
        userChallenge: existingUserChallenge,
        alreadyJoined: false
      });
    }

    //init progress for all activities
    const activitiesProgress = challenge.activities.map(activity => ({
      activityId: activity.name,
      progress: 0,
      lastUpdated: new Date()
    }));

    const userChallenge = new UserChallenge({
      user: req.userId,
      challenge: challengeId,
      activitiesProgress,
      status: 'active',
      joinedAt: new Date()
    });

    await userChallenge.save();

    challenge.participants.push(req.userId);
    await challenge.save();

    await userChallenge.populate('challenge', 'title description activities startDate endDate creator');
    await userChallenge.populate('challenge.creator', 'name email');

    logger.info(`userChallenge:join user=${req.userId} challenge=${challengeId}`);

    res.status(201).json(userChallenge);
  } catch (error) {
    logger.error('joinChallenge error', { error, message: error.message });
    next(error);
  }
};

const getChallengeProgress = async (req, res, next) => {
  try {
    const { challengeId } = req.params;

    const userChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    }).populate('challenge', 'title description activities startDate endDate').lean();

    if (!userChallenge) {
      throw new NotFoundError('User not participating in this challenge');
    }

    res.json(userChallenge);
  } catch (error) {
    logger.error('getChallengeProgress error', { error, message: error.message });
    next(error);
  }
};

const updateActivityProgress = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const { activityId, progress } = req.body;

    if (!activityId || progress === undefined) {
      throw new ValidationError('activityId and progress are required');
    }

    if (typeof progress !== 'number' || progress < 0) {
      throw new ValidationError('Progress must be a non-negative number');
    }

    const userChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    }).populate('challenge', 'activities');

    if (!userChallenge) {
      throw new NotFoundError('User not participating in this challenge');
    }

    const challengeActivity = userChallenge.challenge.activities.find(
      activity => activity.name === activityId
    );

    if (!challengeActivity) {
      throw new NotFoundError('Activity not found in challenge');
    }

    if (progress > challengeActivity.target) {
      throw new ValidationError(`Progress cannot exceed target of ${challengeActivity.target} ${challengeActivity.unit}`);
    }

    const activityIndex = userChallenge.activitiesProgress.findIndex(
      ap => ap.activityId === activityId
    );

    if (activityIndex >= 0) {
      userChallenge.activitiesProgress[activityIndex].progress = progress;
      userChallenge.activitiesProgress[activityIndex].lastUpdated = new Date();
    } else {
      userChallenge.activitiesProgress.push({ activityId, progress, lastUpdated: new Date() });
    }

    await userChallenge.save();

    logger.info(`userChallenge:updateProgress user=${req.userId} challenge=${challengeId} activity=${activityId} progress=${progress}`);

    res.json(userChallenge);
  } catch (error) {
    logger.error('updateActivityProgress error', { error, message: error.message });
    next(error);
  }
};

const updateChallengeStatus = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const { status } = req.body;

    if (!['completed', 'abandoned'].includes(status)) {
      throw new ValidationError('Status must be completed or abandoned');
    }

    const userChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    });

    if (!userChallenge) {
      throw new NotFoundError('User not participating in this challenge');
    }

    userChallenge.status = status;
    userChallenge.completedAt = new Date();

    await userChallenge.save();

    //if abandoning, remove user from challenge participants
    if (status === 'abandoned') {
      const challenge = await Challenge.findById(challengeId);
      if (challenge?.participants) {
        challenge.participants = challenge.participants.filter(
          participantId => participantId.toString() !== req.userId.toString()
        );
        await challenge.save();
      }
    }

    logger.info(`userChallenge:updateStatus user=${req.userId} challenge=${challengeId} status=${status}`);

    res.json(userChallenge);
  } catch (error) {
    logger.error('updateChallengeStatus error', { error, message: error.message });
    next(error);
  }
};

const getChallengeParticipantsCount = async (req, res, next) => {
  try {
    const { challengeId } = req.params;
    const statuses = ['active'];
    if (req.query.includeCompleted === 'true') {
      statuses.push('completed');
    }

    const count = await UserChallenge.countDocuments({
      challenge: challengeId,
      status: { $in: statuses }
    });
    res.json({ count });
  } catch (error) {
    logger.error('getChallengeParticipantsCount error', { error, message: error.message });
    next(error);
  }
};

module.exports = {
  getUserChallenges,
  getAllUserChallenges,
  joinChallenge,
  getChallengeProgress,
  updateActivityProgress,
  updateChallengeStatus,
  getChallengeParticipantsCount
};
