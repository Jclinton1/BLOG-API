const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authenticationMiddleware');

const router = express.Router();

router.use(authMiddleware)

// Route to get user profile (logged-in user details)
router.get('/profile', userController.getUserProfile);

// Route to update user profile
router.put('/profile', userController.updateUserProfile);


module.exports = router;
