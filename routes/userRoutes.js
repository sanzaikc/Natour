const express = require('express');

const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
