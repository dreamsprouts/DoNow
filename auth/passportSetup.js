const passport = require('passport');
const User = require('../models/User'); // 調整路徑以符合您的項目結構

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

// 引入 Google 認證策略設定
require('./strategies/googleStrategy')(passport);

module.exports = passport;
