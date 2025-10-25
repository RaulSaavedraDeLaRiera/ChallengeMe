//authentication tests: register and login endpoints
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User.model');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    //connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    //clean up test data before each test
    await User.deleteMany({ email: /test@/ });
  });

  afterAll(async () => {
    //clean up test data
    await User.deleteMany({ email: /test@/ });
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('name', 'Test User');
    });

    it('should not register duplicate email', async () => {
      const timestamp = Date.now();
      const email = `test@duplicate${timestamp}.com`;
      
      //first register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: email,
          password: 'password123'
        });

      //try to register same email again
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User 2',
          email: email,
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });

    it('should require all fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User'
        });
      
      expect(res.statusCode).toBe(500);
    });

    it('should validate email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
    });

    it('should require minimum password length', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test2@example.com',
          password: '123'
        });
      
      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const timestamp = Date.now();
      const email = `test@login${timestamp}.com`;
      
      //first register a user
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: email,
          password: 'password123'
        });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: email,
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toBe('Login successful');
    });

    it('should not login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should require email and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });
      
      expect(res.statusCode).toBe(401);
    });
  });
});
