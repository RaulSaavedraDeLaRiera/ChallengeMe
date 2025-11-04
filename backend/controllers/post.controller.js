//social posts: create, like, comment, feed...
const Post = require('../models/Post.model');
const Follow = require('../models/Follow.model');

const getAllPosts = async (req, res) => {
  try { 
    const { author } = req.query;
    const query = author ? { user: author } : {};
     
    const posts = await Post.find(query)
      .populate('user', 'name email')
      .populate('challenge', 'title')
      .populate('likes', 'name')
      .populate('comments.user', 'name')
      .sort({ createdAt: -1 });
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//get feed with posts only from users you follow (or all if not logged in)
const getFeed = async (req, res) => {
  try {
    let userId = req.userId;
    
    let posts;
    if (userId) {
      //get users that current user follows
      const follows = await Follow.find({ follower: userId });
      const followingIds = follows.map(f => f.following);
      
      //get posts from users you follow
      posts = await Post.find({ user: { $in: followingIds } })
        .populate('user', 'name email')
        .populate('challenge', 'title')
        .populate('likes', 'name')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 });
    } else {
      //if not logged in, show all posts
      posts = await Post.find()
        .populate('user', 'name email')
        .populate('challenge', 'title')
        .populate('likes', 'name')
        .populate('comments.user', 'name')
        .sort({ createdAt: -1 });
    }
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createPost = async (req, res) => {
  try {
    const title = ((req.body.title ?? '') + '').trim().slice(0, 20)
    const post = new Post({
      user: req.userId,
      challenge: req.body.challenge || null,
      title: title || '',
      content: req.body.content
    });
    
    await post.save();
    await post.populate('user', 'name email');
    await post.populate('challenge', 'title');
    console.log(`post:create id=${post._id.toString()} user=${post.user?.name} title=${post.title}`)
    
    res.status(201).json(post);
  } catch (error) {
    console.error(`post:create error=${error.message}`)
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//toggle like (add or remove like)
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    const liked = post.likes.includes(req.userId);
    
    //if already liked, remove it; otherwise add it
    if (liked) {
      post.likes = post.likes.filter(like => like.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.comments.push({
      user: req.userId,
      text: req.body.text
    });
    
    await post.save();
    await post.populate('user', 'name email');
    await post.populate('challenge', 'title');
    await post.populate('comments.user', 'name');
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllPosts,
  getFeed,
  createPost,
  likePost,
  addComment
};
