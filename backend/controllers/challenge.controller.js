//challenge management: create, join, list challenges
const Challenge = require('../models/Challenge.model');

const getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('creator', 'name email')
      .populate('participants', 'name')
      .sort({ createdAt: -1 });
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('participants', 'name email');
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createChallenge = async (req, res) => {
  try {
    const challenge = new Challenge({
      ...req.body,
      creator: req.userId
    });
    await challenge.save();
    
    await challenge.populate('creator', 'name email');
    await challenge.populate('participants', 'name');
    
    res.status(201).json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//join a challenge (add to participants)
const joinChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }
    
    //check if already participating
    if (challenge.participants.includes(req.userId)) {
      return res.status(400).json({ message: 'Already participating' });
    }
    
    //add to participants
    challenge.participants.push(req.userId);
    await challenge.save();
    
    await challenge.populate('creator', 'name email');
    await challenge.populate('participants', 'name email');
    
    res.json(challenge);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//get challenges where user is creator or participant
const getMyChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      $or: [
        { creator: req.userId },
        { participants: req.userId }
      ]
    })
      .populate('creator', 'name email')
      .populate('participants', 'name')
      .sort({ createdAt: -1 });
    
    res.json(challenges);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  joinChallenge,
  getMyChallenges
};
