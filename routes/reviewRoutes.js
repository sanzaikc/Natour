const express = require('express');

const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

//Merging params from tour router
const router = express.Router({ mergeParams: true });

// Allow only authenticated user's access
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.setTourReviewParams, reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('admin', 'user'),
    reviewController.deleteReview
  );

module.exports = router;
