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

/**
 * @swagger
 * /api/challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [Challenges]
 *     responses:
 *       200:
 *         description: List of challenges
 */
router.get('/', getAllChallenges);

/**
 * @swagger
 * /api/challenges/me:
 *   get:
 *     summary: Get my challenges
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user challenges
 */
router.get('/me', authMiddleware, getMyChallenges);

/**
 * @swagger
 * /api/challenges/{id}:
 *   get:
 *     summary: Get challenge by ID
 *     tags: [Challenges]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses: 
 *       200:
 *         description: Challenge data
 */
router.get('/:id', getChallengeById);

/**
 * @swagger
 * /api/challenges:
 *   post:
 *     summary: Create a new challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startDate
 *               - endDate
 *               - activities
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               activities:
 *                 type: array
 *     responses:
 *       201:
 *         description: Challenge created
 */
router.post('/', authMiddleware, createChallenge);

/**
 * @swagger
 * /api/challenges/{id}/join:
 *   put:
 *     summary: Join a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully joined challenge
 */
router.put('/:id/join', authMiddleware, joinChallenge);

module.exports = router;
