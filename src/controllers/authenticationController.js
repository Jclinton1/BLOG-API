const bcrypt = require('bcrypt');
const User = require('../database/models/userModel');
const { createJWTToken } = require('../utils/jwt');
const logger = require('../utils/logging');

exports.signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Check if user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Sign-up failed: User with email ${email} already exists.`);
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // New user instance
    const user = new User({
      first_name,
      last_name,
      email,
      password,
    });

    // Hash the password
    const saltRounds = 10;
    user.password = await bcrypt.hash(password, saltRounds);

    // Save user to database
    await user.save();

    // Generate a JWT token for the new user
    const token = createJWTToken(user);

    logger.info(`New user signed up: ${email}`);

    // Return the token to the client
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    logger.error('Error signing up user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user with the given email
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn(`Sign-in failed: Invalid email or password for email ${email}.`);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate a JWT token for the authenticated user
    const token = createJWTToken(user);

    logger.info(`User signed in: ${email}`);

    // Return the token to the client
    res.json({ token, userId: user._id });
  } catch (error) {
    logger.error('Error signing in user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
