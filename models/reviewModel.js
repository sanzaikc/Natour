const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4.0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must belongs to a tour'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belongs to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// QUERY MIDDEWARES
reviewSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'tour',
  }).populate({
    path: 'user',
    select:
      '-__v -passwordChangedAt -passwordResetExpiresIn -passwordResetToken',
  });

  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
