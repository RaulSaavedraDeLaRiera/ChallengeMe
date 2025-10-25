//user profile tests: get current user info 
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User.model');

describe('User Endpoints', () => {
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
    await User.deleteMany({ email: /test@/ });
    
    //recreate test user for each test with unique email
    const timestamp = Date.now();
    const user = new User({
      name: 'Test User',
      email: `test@users${timestamp}.com`,
      password: 'password123'
    });
    await user.save();
    userId = user._id;

    //login to get fresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: `test@users${timestamp}.com`,
        password: 'password123'
      });
    
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    //clean up
    await User.deleteMany({ email: /test@/ });
    await mongoose.connection.close();
  });

  describe('GET /api/users/me', () => {
    it('should get current user profile', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'Test User');
      expect(res.body).toHaveProperty('email');
      expect(res.body.email).toMatch(/test@users\d+\.com/);
      expect(res.body).not.toHaveProperty('password');
    });

    it('should require authentication', async () => {
      const res = await request(app)
        .get('/api/users/me');

      expect(res.statusCode).toBe(401);
    });

    it('should return 404 for non-existent user', async () => {
      //create a fake token for non-existent user
      const jwt = require('jsonwebtoken');
      const fakeToken = jwt.sign({ userId: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
      
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.statusCode).toBe(404);
    });

    it('should return 401 for invalid token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toBe(401);
    });

    it('should return 401 for malformed token', async () => {
      const res = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'InvalidFormat token');

      expect(res.statusCode).toBe(401);
    });
  });
});
