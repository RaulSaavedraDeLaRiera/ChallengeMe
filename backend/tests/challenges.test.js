//challenge tests: create, join, get challenges
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const Challenge = require('../models/Challenge.model');
const User = require('../models/User.model');

describe('Challenge Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    //connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    //clean up test data before each test
    await Challenge.deleteMany({});
    await User.deleteMany({ email: /test@/ });
    
    //recreate test user for each test with unique email
    const timestamp = Date.now();
    const user = new User({
      name: 'Test User',
      email: `test@challenge${timestamp}.com`,
      password: 'password123'
    });
    await user.save();
    userId = user._id;

    //login to get fresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `test@challenge${timestamp}.com`,
        password: 'password123'
      });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    //clean up
    await Challenge.deleteMany({});
    await User.deleteMany({ email: /test@/ });
    await mongoose.connection.close();
  });

  describe('POST /api/challenges', () => {
    it('should create a challenge', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '30 Day Running Challenge',
          description: 'Run every day for 30 days',
          activities: [
            { name: 'run', target: 5000, unit: 'meters' }
          ],
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', '30 Day Running Challenge');
      expect(res.body.activities).toHaveLength(1);
    });

    it('should require authentication to create challenge', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .send({
          title: 'Test Challenge',
          activities: [{ name: 'run', target: 1000, unit: 'meters' }],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect(res.statusCode).toBe(401);
    });

    it('should require title and activities', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test challenge without title'
        });

      expect(res.statusCode).toBe(500);
    });

    it('should validate activity enum values', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Activity Challenge',
          activities: [{ name: 'invalid-activity', target: 100, unit: 'times' }],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect(res.statusCode).toBe(500);
    });
  });

  describe('GET /api/challenges', () => {
    it('should get all challenges', async () => {
      const res = await request(app)
        .get('/api/challenges');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should get challenge by id', async () => {
      //create a challenge first
      const challenge = await Challenge.create({
        title: 'Get Test Challenge',
        activities: [{ name: 'push-ups', target: 50, unit: 'times' }],
        creator: userId,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .get(`/api/challenges/${challenge._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe('Get Test Challenge');
    });

    it('should return 404 for non-existent challenge', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/challenges/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });

    it('should get my challenges', async () => {
      const res = await request(app)
        .get('/api/challenges/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('PUT /api/challenges/:id/join', () => {
    it('should join a challenge', async () => {
      //create a challenge first
      const challenge = await Challenge.create({
        title: 'Join Test Challenge',
        activities: [{ name: 'push-ups', target: 100, unit: 'times' }],
        creator: userId,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .put(`/api/challenges/${challenge._id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.participants.some(p => p._id === userId.toString() || p === userId.toString())).toBe(true);
    });

    it('should require authentication to join', async () => {
      const challenge = await Challenge.create({
        title: 'Auth Test Challenge',
        activities: [{ name: 'run', target: 1000, unit: 'meters' }],
        creator: userId,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      const res = await request(app)
        .put(`/api/challenges/${challenge._id}/join`);

      expect(res.statusCode).toBe(401);
    });

    it('should not join non-existent challenge', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/challenges/${fakeId}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should not join same challenge twice', async () => {
      const challenge = await Challenge.create({
        title: 'Double Join Test',
        activities: [{ name: 'squats', target: 50, unit: 'times' }],
        creator: userId,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });

      //join first time
      await request(app)
        .put(`/api/challenges/${challenge._id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      //try to join again
      const res = await request(app)
        .put(`/api/challenges/${challenge._id}/join`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Already participating');
    });
  });
});
