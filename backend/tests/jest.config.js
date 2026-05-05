//jest configuration for backend tests
module.exports = {
  testEnvironment: 'node',
  maxWorkers: 1, // run suites serially to avoid shared-DB race conditions
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/*.test.js'],
  collectCoverageFrom: [
    '../controllers/**/*.js',
    '../models/**/*.js',
    '../middlewares/**/*.js',
    '../routes/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'html']
}; 
