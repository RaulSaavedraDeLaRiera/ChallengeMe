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

router.post('/:userId', authMiddleware, followUser);
router.delete('/:userId', authMiddleware, unfollowUser);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

module.exports = router;
