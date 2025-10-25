//social posts tests: create, like, comment, feed
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const Challenge = require('../models/Challenge.model');

describe('Post Endpoints', () => {
  let authToken;
  let userId;
  let challengeId;

  beforeAll(async () => {
    //connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    //create test user first
    const user = new User({
      name: 'Test User',
      email: 'test@posts.com',
      password: 'password123'
    });
    await user.save();
    userId = user._id;

    //login to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@posts.com',
        password: 'password123'
      });
    
    authToken = loginRes.body.token;

    //create test challenge
    const challenge = await Challenge.create({
      title: 'Test Challenge for Posts',
      activities: [{ name: 'run', target: 5000, unit: 'meters' }],
      creator: userId,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });
    challengeId = challenge._id;
  });

  beforeEach(async () => {
    //clean up test data before each test
    await Post.deleteMany({});
    await Challenge.deleteMany({});
    await User.deleteMany({ email: /test@/ });
  });

  afterAll(async () => {
    //clean up
    await Post.deleteMany({});
    await Challenge.deleteMany({});
    await User.deleteMany({ email: /test@/ });
    await mongoose.connection.close();
  });

  describe('POST /api/posts', () => {
    it('should create a post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'Just completed my first run!',
          challenge: challengeId
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.content).toBe('Just completed my first run!');
      expect(res.body.user).toBeDefined();
    });

    it('should create a post without challenge', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'General fitness update!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.content).toBe('General fitness update!');
      expect(res.body.challenge).toBeNull();
    });

    it('should require authentication to create post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          content: 'Unauthorized post'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should require content', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/posts', () => {
    it('should get all posts', async () => {
      const res = await request(app)
        .get('/api/posts');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get feed posts', async () => {
      const res = await request(app)
        .get('/api/posts/feed');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/posts/:id/like', () => {
    let postId;

    beforeEach(async () => {
      //create a post for testing
      const post = await Post.create({
        user: userId,
        content: 'Test post for likes',
        challenge: challengeId
      });
      postId = post._id;
    });

    it('should like a post', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.likes).toContainEqual(userId.toString());
    });

    it('should unlike a post', async () => {
      //like first
      await request(app)
        .put(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      //unlike
      const res = await request(app)
        .put(`/api/posts/${postId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.likes).not.toContainEqual(userId.toString());
    });

    it('should require authentication to like', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}/like`);

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/posts/${fakeId}/like`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('POST /api/posts/:id/comment', () => {
    let postId;

    beforeEach(async () => {
      //create a post for testing
      const post = await Post.create({
        user: userId,
        content: 'Test post for comments',
        challenge: challengeId
      });
      postId = post._id;
    });

    it('should add comment to post', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Great job! Keep it up!'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.comments).toHaveLength(1);
      expect(res.body.comments[0].text).toBe('Great job! Keep it up!');
    });

    it('should require authentication to comment', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .send({
          text: 'Unauthorized comment'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should require comment text', async () => {
      const res = await request(app)
        .post(`/api/posts/${postId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(res.statusCode).toBe(500);
    });

    it('should return 404 for non-existent post', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/posts/${fakeId}/comment`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Comment on non-existent post'
        });

      expect(res.statusCode).toBe(404);
    });
  });
});
 