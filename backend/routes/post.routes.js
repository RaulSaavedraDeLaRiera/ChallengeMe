//social post routes: create, like, comment
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware');
const {
  getAllPosts,
  getFeed,
  createPost,
  likePost,
  addComment
} = require('../controllers/post.controller');

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', getAllPosts);

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get feed posts from followed users
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed posts
 */
router.get('/feed', getFeed);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post 
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               challengeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 */
router.post('/', authMiddleware, createPost);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   put:
 *     summary: Like a post
 *     tags: [Posts]
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
 *         description: Post liked
 */
router.put('/:id/like', authMiddleware, likePost);

/**
 * @swagger
 * /api/posts/{id}/comment:
 *   post:
 *     summary: Add comment to post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added
 */
router.post('/:id/comment', authMiddleware, addComment);

module.exports = router;
