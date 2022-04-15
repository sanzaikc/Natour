const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

// Allow only authenticated user's access
router.use(authController.protect);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.uploadUserPhoto, userController.updateMe)
  .delete(userController.deleteMe);

// Restrict access unless admin
router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
