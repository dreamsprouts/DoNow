const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userController = require('../../controllers/userController');

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true // 允許將 req 傳遞給回調函數
    },
    async (req, accessToken, refreshToken, profile, done) => {
        const anonymousId = req.cookies.anonymousId; // 從 cookie 中獲取 anonymousId
        try {
            const email = profile.emails?.[0]?.value || ''; // 使用可選鏈和邏輯或保證 email 的讀取不會因為 undefined 而錯誤
            const user = await userController.processUser({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            anonymousId: anonymousId || '' // 確保有值
        });
        done(null, user);
        } catch (error) {
        done(error, null);
        }
    }
    ));
};

