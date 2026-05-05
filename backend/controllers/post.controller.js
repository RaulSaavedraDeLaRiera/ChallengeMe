//social posts: create, like, comment, feed
const Post = require('../models/Post.model');
const Follow = require('../models/Follow.model');
const logger = require('../utils/logger');
const { ValidationError, NotFoundError } = require('../errors/AppError');

const getAllPosts = async (req, res, next) => {
  try {
    const { author } = req.query;
    const query = author ? { user: author } : {};

    const posts = await Post.find(query)
      .populate('user', 'name email')
      .populate('challenge', 'title')
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (error) {
    logger.error('getAllPosts error', { error, message: error.message });
    next(error);
  }
};

//get feed with posts only from users you follow
const getFeed = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json([]);
    }

    const follows = await Follow.find({ follower: userId }).lean();
    const followingIds = follows.map(f => f.following);

    if (followingIds.length === 0) {
      return res.json([]);
    }

    const posts = await Post.find({ user: { $in: followingIds } })
      .populate('user', 'name email')
      .populate('challenge', 'title')
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 })
      .lean();

    //filter to ensure only posts from followed users
    const followingIdsSet = new Set(followingIds.map(id => id.toString()));
    const filtered = posts.filter(post => {
      const postUserId = post.user?._id || post.user;
      return postUserId && followingIdsSet.has(postUserId.toString());
    });

    res.json(filtered);
  } catch (error) {
    logger.error('getFeed error', { error, message: error.message });
    next(error);
  }
};

const createPost = async (req, res, next) => {
  try {
    if (!req.body.content?.trim()) {
      throw new ValidationError('Post content is required');
    }

    const title = ((req.body.title ?? '') + '').trim().slice(0, 20);
    const post = new Post({
      user: req.userId,
      challenge: req.body.challenge || null,
      title: title || '',
      content: req.body.content
    });

    await post.save();
    await post.populate('user', 'name email');
    await post.populate('challenge', 'title');
    logger.info(`post:create id=${post._id.toString()} user=${post.user?.name} title=${post.title}`);

    res.status(201).json(post);
  } catch (error) {
    logger.error(`post:create error=${error.message}`, { error });
    next(error);
  }
};

//toggle like (add or remove like)
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    const liked = post.likes.includes(req.userId);

    if (liked) {
      post.likes = post.likes.filter(like => like.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    logger.error('likePost error', { error, message: error.message });
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    if (!req.body.text?.trim()) {
      throw new ValidationError('Comment text is required');
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    post.comments.push({ user: req.userId, text: req.body.text });

    await post.save();
    await post.populate('user', 'name email');
    await post.populate('challenge', 'title');
    await post.populate('comments.user', 'name');

    res.json(post);
  } catch (error) {
    logger.error('addComment error', { error, message: error.message });
    next(error);
  }
};

module.exports = {
  getAllPosts,
  getFeed,
  createPost,
  likePost,
  addComment
};
