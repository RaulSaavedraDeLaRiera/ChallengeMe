//user authentication: register and login
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ValidationError, AuthError, ConflictError } = require('../errors/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      throw new ValidationError('Name, email and password are required');
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      throw new ValidationError('Invalid email format');
    }
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).lean();
    if (existingUser) {
      throw new ConflictError('User already exists');
    }

    const user = new User({ name: name.trim(), email: normalizedEmail, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP || '7d' });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      throw new AuthError('Invalid credentials');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).lean();
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthError('Invalid credentials');
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP || '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

//refresh token: generate new token from expired but valid token
const refresh = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AuthError('No token provided');
    }

    let decoded;
    try {
      //verify with ignoreExpiration to allow expired tokens
      decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    } catch {
      throw new AuthError('Invalid token');
    }

    const user = await User.findById(decoded.userId).lean();
    if (!user) {
      throw new AuthError('User not found');
    }

    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXP || '7d' });

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh };
