const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'skillbridge_fallback_secret_key_12345';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    // Role enforcement: prevent students from assigning themselves admin or faculty via public registration
    const assignedRole = role === 'student' ? 'student' : 'student';

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });

    // Automatically create empty StudentProfile for student accounts
    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await StudentProfile.create({
        user: user._id,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account successfully registered.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile: studentProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // If database is not currently connected, return 503 instead of buffering
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please verify MongoDB is running.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'This account is currently suspended or pending verification.',
      });
    }

    const token = generateToken(user._id);

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('targetRoleId');
      if (!profile) {
        profile = await StudentProfile.create({ user: user._id });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    let profile = null;

    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id }).populate('targetRoleId');
      if (!profile) {
        profile = await StudentProfile.create({ user: user._id });
      }
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    next(error);
  }
};
