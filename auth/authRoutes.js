const express = require('express');
const passport = require('passport');
const router = express.Router();

// 觸發 Google 登錄的路由
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 登入成功，重定向到首頁或其他頁面
    const frontendURL =  "http://localhost:3000"; //process.env.FRONTEND_URL
    res.redirect(`${frontendURL}/`);
  }
);

module.exports = router;

