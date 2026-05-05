//challenge management: create, join, list challenges
const Challenge = require('../models/Challenge.model');
const UserChallenge = require('../models/UserChallenge.model');
const logger = require('../utils/logger');
const { NotFoundError, ConflictError } = require('../errors/AppError');

const getAllChallenges = async (req, res, next) => {
  try {
    const { creator } = req.query;
    const query = creator ? { creator } : {};

    const challenges = await Challenge.find(query)
      .populate('creator', 'name email')
      .populate('participants', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(challenges);
  } catch (error) {
    next(error);
  }
};

const getChallengeById = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants', 'name email')
      .lean();

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    res.json(challenge);
  } catch (error) {
    next(error);
  }
};

const createChallenge = async (req, res, next) => {
  try {
    const challenge = new Challenge({
      ...req.body,
      creator: req.userId
    });

    //creator is automatically a participant
    if (!Array.isArray(challenge.participants)) challenge.participants = [];
    if (!challenge.participants.find((p) => p?.toString() === req.userId?.toString())) {
      challenge.participants.push(req.userId);
    }
    await challenge.save();

    //create UserChallenge for creator so it appears in their dashboard
    try {
      const activitiesProgress = challenge.activities.map(activity => ({
        activityId: activity.name,
        progress: 0,
        lastUpdated: new Date()
      }));

      const userChallenge = new UserChallenge({
        user: req.userId,
        challenge: challenge._id,
        activitiesProgress,
        status: 'active',
        joinedAt: new Date()
      });

      await userChallenge.save();
      logger.info(`userChallenge:create user=${req.userId} challenge=${challenge._id.toString()}`);
    } catch (ucError) {
      logger.error(`userChallenge:create error=${ucError.message}`, { error: ucError });
    }

    await challenge.populate('creator', 'name email');
    await challenge.populate('participants', 'name');
    logger.info(`challenge:create id=${challenge._id.toString()} title=${challenge.title}`);

    res.status(201).json(challenge);
  } catch (error) {
    logger.error(`challenge:create error=${error.message}`, { error });
    next(error);
  }
};

//join a challenge (add to participants)
const joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    if (challenge.participants.includes(req.userId)) {
      throw new ConflictError('Already participating');
    }

    challenge.participants.push(req.userId);
    await challenge.save();

    await challenge.populate('creator', 'name email');
    await challenge.populate('participants', 'name email');
    logger.info(`challenge:join id=${challenge._id.toString()} user=${req.userId}`);

    res.json(challenge);
  } catch (error) {
    logger.error('challenge:join error', { error, message: error.message });
    next(error);
  }
};

//get challenges where user is creator or participant
const getMyChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({
      $or: [
        { creator: req.userId },
        { participants: req.userId }
      ]
    })
      .populate('creator', 'name email')
      .populate('participants', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(challenges);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  joinChallenge,
  getMyChallenges
};
