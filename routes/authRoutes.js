const express = require('express');

const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').get(authController.login);

module.exports = router;
