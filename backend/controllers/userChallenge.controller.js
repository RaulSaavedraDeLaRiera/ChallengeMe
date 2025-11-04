//user challenge management: handle users participation and progress in challenges


const UserChallenge = require('../models/UserChallenge.model');
const Challenge = require('../models/Challenge.model');

const getUserChallenges = async (req, res) => {
  try {
    const userChallenges = await UserChallenge.find({ 
      user: req.userId,
      status: 'active'
    })
      .populate('challenge', 'title description activities startDate endDate creator participants')
      .populate('challenge.creator', 'name email')
      .sort({ joinedAt: -1 });
    
    res.json(userChallenges);
  } catch (error) {
    console.error('getUserChallenges error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//get all user challenge
const getAllUserChallenges = async (req, res) => {
  try {
    const userChallenges = await UserChallenge.find({ 
      user: req.userId
    })
      .populate('challenge', 'title description activities startDate endDate creator participants')
      .populate('challenge.creator', 'name email')
      .sort({ joinedAt: -1 });
    
    res.json(userChallenges);
  } catch (error) {
    console.error('getAllUserChallenges error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const existingUserChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    });
    
    //if exists and is active return it
    if (existingUserChallenge && existingUserChallenge.status === 'active') {
      await existingUserChallenge.populate('challenge', 'title description activities startDate endDate creator')
      await existingUserChallenge.populate('challenge.creator', 'name email')
      
      return res.status(200).json({ 
        message: 'Already participating in this challenge',
        userChallenge: existingUserChallenge,
        alreadyJoined: true
      });
    }
    
    //if exists but was abandoned reactivate
    if (existingUserChallenge && existingUserChallenge.status === 'abandoned') {
      //reset progress to 0
      const activitiesProgress = challenge.activities.map(activity => ({
        activityId: activity.name,
        progress: 0,
        lastUpdated: new Date()
      }));
      
      existingUserChallenge.status = 'active'
      existingUserChallenge.activitiesProgress = activitiesProgress
      existingUserChallenge.completedAt = undefined
      existingUserChallenge.joinedAt = new Date()
      
      await existingUserChallenge.save()
      
      //add user to participants if not already there
      if (!challenge.participants.includes(req.userId)) {
        challenge.participants.push(req.userId)
        await challenge.save()
      }
      
      await existingUserChallenge.populate('challenge', 'title description activities startDate endDate creator')
      await existingUserChallenge.populate('challenge.creator', 'name email')
      
      console.log(`userChallenge:rejoin user=${req.userId} challenge=${challengeId}`)
      
      return res.status(200).json({
        message: 'Rejoined challenge',
        userChallenge: existingUserChallenge,
        alreadyJoined: false
      })
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
    
    console.log(`userChallenge:join user=${req.userId} challenge=${challengeId}`);
    
    res.status(201).json(userChallenge);
  } catch (error) {
    console.error('joinChallenge error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChallengeProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    
    const userChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    }).populate('challenge', 'title description activities startDate endDate');
    
    if (!userChallenge) {
      return res.status(404).json({ message: 'User not participating in this challenge' });
    }
    
    res.json(userChallenge);
  } catch (error) {
    console.error('getChallengeProgress error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateActivityProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { activityId, progress } = req.body;
    
    if (!activityId || progress === undefined) {
      return res.status(400).json({ message: 'activityId and progress are required' });
    }
    
    if (progress < 0) {
      return res.status(400).json({ message: 'Progress cannot be negative' });
    }
    
    const userChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    }).populate('challenge', 'activities');
    
    if (!userChallenge) {
      return res.status(404).json({ message: 'User not participating in this challenge' });
    }
    
    const challengeActivity = userChallenge.challenge.activities.find(
      activity => activity.name === activityId
    );
    
    if (!challengeActivity) {
      return res.status(400).json({ message: 'Activity not found in challenge' });
    }
    
    if (progress > challengeActivity.target) {
      return res.status(400).json({ 
        message: `Progress cannot exceed target of ${challengeActivity.target} ${challengeActivity.unit}` 
      });
    }
    
    //update existing or create new progress
    const activityIndex = userChallenge.activitiesProgress.findIndex(
      ap => ap.activityId === activityId
    );
    
    if (activityIndex >= 0) {
      userChallenge.activitiesProgress[activityIndex].progress = progress;
      userChallenge.activitiesProgress[activityIndex].lastUpdated = new Date();
    } else {
      userChallenge.activitiesProgress.push({
        activityId,
        progress,
        lastUpdated: new Date()
      });
    }
    
    await userChallenge.save();
    
    console.log(`userChallenge:updateProgress user=${req.userId} challenge=${challengeId} activity=${activityId} progress=${progress}`);
    
    res.json(userChallenge);
  } catch (error) {
    console.error('updateActivityProgress error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateChallengeStatus = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { status } = req.body;
    
    if (!['completed', 'abandoned'].includes(status)) {
      return res.status(400).json({ message: 'Status must be completed or abandoned' });
    }
    
    const userChallenge = await UserChallenge.findOne({
      user: req.userId,
      challenge: challengeId
    });
    
    if (!userChallenge) {
      return res.status(404).json({ message: 'User not participating in this challenge' });
    }
    
    userChallenge.status = status;
    userChallenge.completedAt = new Date();
    
    await userChallenge.save();
    
    //if abandoning remove user from challenge participants
    if (status === 'abandoned') {
      const challenge = await Challenge.findById(challengeId);
      if (challenge && challenge.participants) {
        challenge.participants = challenge.participants.filter(
          participantId => participantId.toString() !== req.userId.toString()
        );
        await challenge.save();
      }
    }
    
    console.log(`userChallenge:updateStatus user=${req.userId} challenge=${challengeId} status=${status}`);
    
    res.json(userChallenge);
  } catch (error) {
    console.error('updateChallengeStatus error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChallengeParticipantsCount = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const count = await UserChallenge.countDocuments({ 
      challenge: challengeId,
      status: 'active'
    });
    res.json({ count });
  } catch (error) {
    console.error('getChallengeParticipantsCount error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
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
