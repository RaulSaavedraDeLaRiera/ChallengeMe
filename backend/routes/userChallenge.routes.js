//user challenge routes: handle users participation and progress in challenges
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getUserChallenges,
  getAllUserChallenges,
  joinChallenge,
  getChallengeProgress,
  updateActivityProgress,
  updateChallengeStatus,
  getChallengeParticipantsCount
} = require('../controllers/userChallenge.controller');

//get users active challenges with progress (for dashboard)
router.get('/my-challenges', authMiddleware, getUserChallenges);

//get all user challengesfor profile stats
router.get('/all-challenges', authMiddleware, getAllUserChallenges);

//get participants count for a challenge
router.get('/:challengeId/participants-count', getChallengeParticipantsCount);

//join a challenge (creating UserChallenge record) 
router.post('/:challengeId/join', authMiddleware, joinChallenge);

//get progress for a specific challenge
router.get('/:challengeId/progress', authMiddleware, getChallengeProgress);

//update progress for a specific activity
router.put('/:challengeId/progress', authMiddleware, updateActivityProgress);

//complete or abandon a challenge
router.put('/:challengeId/status', authMiddleware, updateChallengeStatus);

module.exports = router;
