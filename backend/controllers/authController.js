const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secretkey123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'An unexpected server error occurred. Please try again later.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Include password for validation
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Run manual streak check if logging in
      if (user.lastActiveDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastActive = new Date(user.lastActiveDate);
        lastActive.setHours(0, 0, 0, 0);

        const diffTime = today - lastActive;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 2) {
          user.streak = 0;
          await user.save();
        }
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        xp: user.xp,
        streak: user.streak,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An unexpected server error occurred. Please try again later.' });
  }
};

// @desc    Get user profile data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user has already been set by authMiddleware
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      xp: req.user.xp,
      streak: req.user.streak,
      lastActiveDate: req.user.lastActiveDate,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'An unexpected server error occurred. Please try again later.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
