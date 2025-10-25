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

router.get('/', getAllPosts);
router.get('/feed', getFeed);
router.post('/', authMiddleware, createPost);
router.put('/:id/like', authMiddleware, likePost);
router.post('/:id/comment', authMiddleware, addComment);

module.exports = router;
