const logger = require('../utils/logging')
const User = require('../database/models/userModel');



// Controller function to get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      logger.warn(`User not found: User ID ${req.user._id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Retrieved user profile for user ID ${req.user._id}`);
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Controller function to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { first_name, last_name, email } = req.body;

    // Update user information
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { first_name, last_name, email },
      { new: true }
    );

    if (!user) {

      logger.warn(`User not found: User ID ${req.user._id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Retrieved user profile for user ID ${req.user._id}`);
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    });

  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getUserProfile, updateUserProfile }