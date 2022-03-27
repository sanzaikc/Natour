const User = require('../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const APIParams = require('../utils/apiParams');

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

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'api under development',
  });
};
