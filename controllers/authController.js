const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');
const User = require('./../models/userModel');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createResponseWithToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    // role,
  });

  createResponseWithToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.authenticatePassword(password, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  createResponseWithToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader && authorizationHeader.startsWith('Bearer'))
    token = authorizationHeader.split(' ')[1];

  if (!token)
    return next(
      new AppError(
        'You need to be logged in. Please login to access the resource',
        401
      )
    );

  // VERIFYING THE TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // CHECK IF USER STILL EXISTS
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError('The user belonging to the token no longer exists', 401)
    );

  // CHECK IF USER HAS CHANGED THEIR PASSWORD
  if (currentUser.changedPasswordAfter(decoded.iat))
    return next(
      new AppError(
        'The password of the user have been recently changed. Please log in again',
        401
      )
    );

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      next(
        new AppError('You do not have permission to perform this action', 403)
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(new AppError('The user with that email does not exists', 404));

  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/reset-password/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to :${resetUrl}.\n If you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresIn: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid or expired token', 404));

  const { password, passwordConfirm } = req.body;

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresIn = undefined;
  await user.save();

  createResponseWithToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  if (
    !user ||
    !(await user.authenticatePassword(passwordCurrent, user.password))
  )
    return next(new AppError('The current password did not matched', 401));

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createResponseWithToken(user, 200, res);
});
