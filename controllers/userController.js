const User = require('../models/userModel');

exports.getAllUsers = async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    totalItems: users.length,
    data: {
      users,
    },
  });
};

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
