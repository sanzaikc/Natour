const APIParams = require('../utils/apiParams');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const User = require('../models/userModel');

const filterObj = (obj, ...allowedFields) => {
  let filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) filteredObj[key] = obj[key];
  });

  return filteredObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const params = new APIParams(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await params.query;

  res.status(200).json({
    status: 'success',
    totalItems: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route is not for password modifications', 400)
    );

  const validReq = filterObj(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, validReq, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'api under development',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'api under development',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'api under development',
  });
};

exports.deleteUser = factory.deleteOne(User);
