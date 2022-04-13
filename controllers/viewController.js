const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const Tour = require('./../models/tourModel');

// ACCOUNT
exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getAccountDetails = catchAsync(async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Account',
  });
});

// TOURS
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour)
    return next(new AppError('Could not find tour with that name!', 404));

  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});
