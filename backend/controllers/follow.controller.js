//user follow system: follow, unfollow, get followers
const Follow = require('../models/Follow.model');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError, ConflictError } = require('../errors/AppError');

//follow a user
const followUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (userId === req.userId) {
      throw new ValidationError('Cannot follow yourself');
    }

    const existingFollow = await Follow.findOne({ follower: req.userId, following: userId }).lean();
    if (existingFollow) {
      throw new ConflictError('Already following this user');
    }

    const follow = new Follow({ follower: req.userId, following: userId });
    await follow.save();
    logger.info(`follow:create follower=${req.userId} following=${userId}`);

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    logger.error('follow:create error', { error, message: error.message });
    next(error);
  }
};

//unfollow a user
const unfollowUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({ follower: req.userId, following: userId });

    if (!follow) {
      throw new NotFoundError('Not following this user');
    }

    logger.info(`follow:delete follower=${req.userId} following=${userId}`);
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    logger.error('follow:delete error', { error, message: error.message });
    next(error);
  }
};

//get followers of a user
const getFollowers = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate('follower', 'name email').lean();
    res.json(follows.map(f => f.follower));
  } catch (error) {
    logger.error('getFollowers error', { error, message: error.message });
    next(error);
  }
};

//get users that a user is following
const getFollowing = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate('following', 'name email').lean();
    res.json(follows.map(f => f.following));
  } catch (error) {
    logger.error('getFollowing error', { error, message: error.message });
    next(error);
  }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing };
