//test setup file 
//set test environment variables before requiring dotenv
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/challengeme_test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = '3001';

require('dotenv').config();

//increase timeout for database operations
jest.setTimeout(30000); 
