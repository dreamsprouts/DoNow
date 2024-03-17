const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userController = require('../../controllers/userController');
const User = require('../../models/User'); // 調整路徑以符合您的項目結構


module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true // 允許將 req 傳遞給回調函數
    },
    
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const anonymousId = req.cookies.anonymousId; // 從 cookie 中獲取 anonymousId
            if (!anonymousId) {console.log(anonymousId)};
            const email = profile.emails?.[0]?.value; // 使用可選鏈來嘗試獲取 email，如果不存在則為 undefined
            // 構造一個用戶對象，僅當 email 存在時才添加 email 屬性
            const userPayload = {
                googleId: profile.id,
                name: profile.displayName,
                anonymousId: anonymousId
            };
            if (email) { // 僅當 email 存在時才添加到用戶對象中
                userPayload.email = email;
            }
            const user = await userController.processUser(userPayload);
            done(null, user); // 認證成功，將用戶對象傳遞給 Passport
        } catch (error) {
            done(error, null);
        }
    }
    ));
};

