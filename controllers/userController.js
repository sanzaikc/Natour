const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const AppError = require('../utils/appError');
// const APIParams = require('../utils/apiParams');
const User = require('../models/userModel');

// Multer file upload middleware
const imageDestination = 'public/img/users/';

// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, imageDestination);
//   },
//   filename: function (req, file, cb) {
//     const extension = file.mimetype.split('/')[1];
//     const fileName = `user-${req.user.id}-${Date.now()}.${extension}`;
//     cb(null, fileName);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else
    cb(
      new AppError('Not an image! Please upload image files only', 400),
      false
    );
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(`${imageDestination}${req.file.filename}`);

  next();
};

const filterObj = (obj, ...allowedFields) => {
  let filteredObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) filteredObj[key] = obj[key];
  });

  return filteredObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('This route is not for password modifications', 400)
    );

  const validReq = filterObj(req.body, 'name', 'email');
  if (req.file) validReq.photo = req.file.filename;

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

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
