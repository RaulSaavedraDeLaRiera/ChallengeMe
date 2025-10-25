//follow system tests: follow, unfollow, get followers
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User.model');
const Follow = require('../models/Follow.model');

describe('Follow Endpoints', () => {
  let authToken;
  let userId;
  let targetUserId;

  beforeAll(async () => {
    //connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    //clean up test data before each test
    await Follow.deleteMany({});
    await User.deleteMany({ email: /test@/ });
    
    //recreate test users for each test with unique emails
    const timestamp = Date.now();
    const user = new User({
      name: 'Test User',
      email: `test@follow${timestamp}.com`,
      password: 'password123'
    });
    await user.save();
    userId = user._id;

    const targetUser = new User({
      name: 'Target User',
      email: `target@follow${timestamp}.com`,
      password: 'password123'
    });
    await targetUser.save();
    targetUserId = targetUser._id;

    //login to get fresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `test@follow${timestamp}.com`,
        password: 'password123'
      });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    //clean up
    await Follow.deleteMany({});
    await User.deleteMany({ email: /test@/ });
    await mongoose.connection.close();
  });

  describe('POST /api/follow/:userId', () => {
    it('should follow a user', async () => {
      const res = await request(app)
        .post(`/api/follow/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User followed successfully');
    });

    it('should require authentication to follow', async () => {
      const res = await request(app)
        .post(`/api/follow/${targetUserId}`);

      expect(res.statusCode).toBe(401);
    });

    it('should not follow yourself', async () => {
      const res = await request(app)
        .post(`/api/follow/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Cannot follow yourself');
    });

    it('should not follow same user twice', async () => {
      //first follow the user
      await request(app)
        .post(`/api/follow/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      //try to follow again
      const res = await request(app)
        .post(`/api/follow/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Already following this user');
    });

    it('should return 200 for non-existent user (creates follow anyway)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/follow/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User followed successfully');
    });
  });

  describe('DELETE /api/follow/:userId', () => {
    it('should unfollow a user', async () => {
      //first follow the user
      await request(app)
        .post(`/api/follow/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      //then unfollow
      const res = await request(app)
        .delete(`/api/follow/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('User unfollowed successfully');
    });

    it('should require authentication to unfollow', async () => {
      const res = await request(app)
        .delete(`/api/follow/${targetUserId}`);

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 when not following user', async () => {
      const res = await request(app)
        .delete(`/api/follow/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Not following this user');
    });
  });

  describe('GET /api/follow/followers/:userId', () => {
    it('should get followers of a user', async () => {
      //create a follow relationship first
      await Follow.create({
        follower: userId,
        following: targetUserId
      });

      const res = await request(app)
        .get(`/api/follow/followers/${targetUserId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return empty array for user with no followers', async () => {
      const newUserId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/follow/followers/${newUserId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });

  describe('GET /api/follow/following/:userId', () => {
    it('should get users that a user is following', async () => {
      const res = await request(app)
        .get(`/api/follow/following/${userId}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return empty array for user following no one', async () => {
      const newUserId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/follow/following/${newUserId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(0);
    });
  });
});
