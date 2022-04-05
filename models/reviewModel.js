const mongoose = require('mongoose');

const Tour = require('./tourModel');

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

// QUERY INDEXES
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// STATIC METHODS
reviewSchema.statics.calcAvgRating = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        totalRatings: { $sum: 1 },
        averageRatings: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0]?.averageRatings ?? 0,
    ratingsQuantity: stats[0]?.totalRatings ?? 4.5,
  });
};

// QUERY MIDDEWARES
reviewSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// Calculating average ratings after saving a document
reviewSchema.post('save', function (doc) {
  doc.constructor.calcAvgRating(doc.tour);
});

// Calculating average rating after updating/deleting a document
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.rev = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.rev.constructor.calcAvgRating(this.rev.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
