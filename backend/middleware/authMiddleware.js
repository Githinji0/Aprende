const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read token from headers (Bearer token) or query params/cookies
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

    // Get user from the database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // --- STREAK MECHANICS MIDDLEWARE SYSTEM CHECK ---
    if (user.lastActiveDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastActive = new Date(user.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      const diffTime = today - lastActive;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // If last active was older than 48 hours (diffDays >= 2), reset streak to 0
      if (diffDays >= 2) {
        user.streak = 0;
        await user.save();
      }
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

module.exports = { protect };
