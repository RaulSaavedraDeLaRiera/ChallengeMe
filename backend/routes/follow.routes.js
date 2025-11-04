//follow system routes: follow, unfollow, get followers
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/follow.controller');

/**
 * @swagger
 * /api/follow/{userId}:
 *   post:
 *     summary: Follow a user
 *     tags: [Follow]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully followed user
 */
router.post('/:userId', authMiddleware, followUser);

/**
 * @swagger
 * /api/follow/{userId}:
 *   delete:
 *     summary: Unfollow a user
 *     tags: [Follow]
 *     security: 
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 */
router.delete('/:userId', authMiddleware, unfollowUser);

/**
 * @swagger
 * /api/follow/followers/{userId}:
 *   get:
 *     summary: Get user followers
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of followers
 */
router.get('/followers/:userId', getFollowers);

/**
 * @swagger
 * /api/follow/following/{userId}:
 *   get:
 *     summary: Get users following
 *     tags: [Follow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of following users
 */
router.get('/following/:userId', getFollowing);

module.exports = router;
