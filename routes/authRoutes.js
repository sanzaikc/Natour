const express = require('express');

const authController = require('./../controllers/authController');

const router = express.Router();

// router.route('/signup').post(authController.signUp);
// router.route('/login').get(authController.login);
// router.route('/forgot-password').post(authController.forgotPassword);
// router.route('/reset-password/:token').patch(authController.resetPassword);
// router
//   .route('/update-password')
//   .patch(authController.protect, authController.updatePassword);

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
