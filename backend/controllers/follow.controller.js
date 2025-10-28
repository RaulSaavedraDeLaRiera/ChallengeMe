//user follow system : follow, unfollow, get his followers
const Follow = require('../models/Follow.model');

//follow a user
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    //cannot follow yourself
    if (userId === req.userId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    //check if already following
    const existingFollow = await Follow.findOne({ follower: req.userId, following: userId });
    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    //create follow relationship
    const follow = new Follow({
      follower: req.userId,
      following: userId
    });
    await follow.save();
    console.log(`follow:create follower=${req.userId} following=${userId}`)

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    console.error('follow:create error', error.message)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//unfollow a user
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const follow = await Follow.findOneAndDelete({ follower: req.userId, following: userId });
    
    if (!follow) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    console.log(`follow:delete follower=${req.userId} following=${userId}`)
    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('follow:delete error', error.message)
    console.error(`follow:create error=${error.message}`)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//get followers of a user
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate('follower', 'name email');
    res.json(follows.map(f => f.follower));
  } catch (error) {
    console.error(`follow:delete error=${error.message}`)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//get users that a user is following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate('following', 'name email');
    res.json(follows.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { followUser, unfollowUser, getFollowers, getFollowing };
