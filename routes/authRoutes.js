const express = require('express');

const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);

router.get('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.patch('/reset-password/:token', authController.resetPassword);

router.patch(
  '/update-password',
  authController.protect,
  authController.updatePassword
);

module.exports = router;
