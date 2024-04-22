const jwt = require('jsonwebtoken');
const User = require('../database/models/userModel');
const logger = require('../utils/logging');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    logger.warn('Authorization token missing');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      logger.info(`User not found: ${decoded.email}`);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      logger.error('JWT token error:', error.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    logger.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = authMiddleware;
