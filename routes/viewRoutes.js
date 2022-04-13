const express = require('express');

const authController = require('./../controllers/authController');
const viewController = require('./../controllers/viewController');

const router = express.Router();

router.use(authController.isLoggedIn);

router.get('/login', viewController.getLoginForm);

router.get('/me', viewController.getAccountDetails);

router.get('/', viewController.getOverview);

router.get('/tour/:slug', viewController.getTour);

module.exports = router;
