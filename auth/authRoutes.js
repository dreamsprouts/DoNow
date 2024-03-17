const express = require('express');
const passport = require('passport');
const router = express.Router();

// 觸發 Google 登錄的路由
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] })
);
router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // 登入成功，重定向到首頁或其他頁面
    const frontendURL =  "http://localhost:3000"; //process.env.FRONTEND_URL
    res.redirect(`${frontendURL}/`);
  }
);

// 檢查用戶的登入狀態
router.get('/api/auth/status', (req, res) => {
  console.log("/api/auth/status");
  const isLoggedIn = req.isAuthenticated(); // 將 isAuthenticated() 方法的結果存儲在 isLoggedIn 變數中
  if (isLoggedIn) { // 使用 Passport 提供的 isAuthenticated 方法來檢查
    // 如果用戶已經登入，返回登入狀態和用戶資訊
    res.json({ isLoggedIn: true, user: req.user });
    // console.log("isLoggedIn: "+isLoggedIn);
  } else {
    // 如果用戶未登入，返回未登入狀態
    res.json({ isLoggedIn: false });
  // console.log("isLoggedIn: "+isLoggedIn);
  }
  console.log("isLoggedIn: "+isLoggedIn);
});

// 處理登出
router.get('/auth/logout', (req, res) => {
  req.logout((err) => { // 添加回調函數來處理登出
    if (err) { return next(err); }
    req.session.destroy((err) => { // 銷毀會話也需要一個回調函數
      if (err) {
        console.log("Session Destroy Error:", err);
        return next(err);
      }
      res.clearCookie('connect.sid'); // 清除 connect.sid cookie
      res.json({ isLoggedIn: false }); // 返回用戶已登出的狀態
    });
  });
});


module.exports = router;

