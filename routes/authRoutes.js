const express = require('express');

const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').get(authController.login);
router.route('/forgot-password').post(authController.forgotPassword);
router.route('/reset-password').get(authController.resetPassword);

module.exports = router;
