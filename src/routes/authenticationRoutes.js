const express = require('express');
const router = express.Router();
const authController = require('../controllers/authenticationController');

router.post('/signup', authController.signup);
router.post('/signin', authController.signin);

module.exports = router;
