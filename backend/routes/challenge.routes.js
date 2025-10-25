//challenge routes: crud and join challenges
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  joinChallenge,
  getMyChallenges
} = require('../controllers/challenge.controller');

router.get('/', getAllChallenges);
router.get('/me', authMiddleware, getMyChallenges);
router.get('/:id', getChallengeById);
router.post('/', authMiddleware, createChallenge);
router.put('/:id/join', authMiddleware, joinChallenge);

module.exports = router;
