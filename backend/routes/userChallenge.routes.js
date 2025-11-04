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

/**
 * @swagger
 * /api/user-challenges/my-challenges:
 *   get:
 *     summary: Get user active challenges with progress
 *     tags: [User Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User challenges
 */
router.get('/my-challenges', authMiddleware, getUserChallenges);

/**
 * @swagger
 * /api/user-challenges/all-challenges:
 *   get:
 *     summary: Get all user challenges for profile stats
 *     tags: [User Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All user challenges
 */
router.get('/all-challenges', authMiddleware, getAllUserChallenges);

/**
 * @swagger
 * /api/user-challenges/{challengeId}/participants-count:
 *   get:
 *     summary: Get challenge participants count
 *     tags: [User Challenges]
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Participants count
 */
router.get('/:challengeId/participants-count', getChallengeParticipantsCount);

/**
 * @swagger
 * /api/user-challenges/{challengeId}/join:
 *   post:
 *     summary: Join a challenge
 *     tags: [User Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined challenge
 */
router.post('/:challengeId/join', authMiddleware, joinChallenge);

/**
 * @swagger
 * /api/user-challenges/{challengeId}/progress:
 *   get:
 *     summary: Get challenge progress
 *     tags: [User Challenges] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Challenge progress 
 */
router.get('/:challengeId/progress', authMiddleware, getChallengeProgress);

/**
 * @swagger
 * /api/user-challenges/{challengeId}/progress:
 *   put:
 *     summary: Update activity progress
 *     tags: [User Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityId:
 *                 type: string
 *               progress:
 *                 type: number
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put('/:challengeId/progress', authMiddleware, updateActivityProgress);

/**
 * @swagger
 * /api/user-challenges/{challengeId}/status:
 *   put:
 *     summary: Update challenge status (complete or abandon)
 *     tags: [User Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: challengeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, completed, abandoned]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put('/:challengeId/status', authMiddleware, updateChallengeStatus);

module.exports = router;
