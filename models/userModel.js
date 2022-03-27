const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "The passwords provided didn't matched",
    },
  },
  passwordChangedAt: Date,
});

// ENCRPTING PASSWORD
userSchema.pre('save', async function (next) {
  if (!this.isModified(this.password)) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// INSTANCE METHODS THAT CAN BE ACCESSED BY DOCUMENT
userSchema.methods.authenticatePassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedPasswordTimeStamp = this.passwordChangedAt.getTime() / 1000;
    return JWTTimeStamp < changedPasswordTimeStamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
