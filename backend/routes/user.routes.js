//user profile routes
const express = require('express');
const router = express.Router();
const { getMe, getUserById, searchUsers } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/me', authMiddleware, getMe);
router.get('/search', searchUsers);
router.get('/:userId', getUserById);

module.exports = router; 
