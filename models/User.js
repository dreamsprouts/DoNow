const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    sparse: true, // 使得email可以是唯一的，但也允許null值
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isAnonymous: {
    type: Boolean,
    default: true,
  },
  anonymousId: [{
    type: String,
    unique: true,
    sparse: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
