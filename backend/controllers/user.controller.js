//user profile management
const User = require('../models/User.model');
const { NotFoundError } = require('../errors/AppError');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password').lean();
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      throw new NotFoundError('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

//search users by name or email
const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length === 0) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(20).lean();

    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = { getMe, getUserById, searchUsers };
