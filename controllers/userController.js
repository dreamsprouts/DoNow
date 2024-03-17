const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

exports.confirmUserIdentity = async (req, res) => {
  let userId = req.cookies['userId'];
  let anonymousId = req.cookies['anonymousId'];
  console.log('Confirm user identity called.'); // 日誌記錄

  if (!anonymousId) {
    anonymousId = uuidv4(); // 如果不存在就創建一個新的
    // 立即將新生成的 anonymousId 存入 cookie
    res.cookie('anonymousId', anonymousId, { httpOnly: true, sameSite: 'lax' });
  }

  if (!userId) {
    // 尋找或創建匿名用戶
    let user = await User.findOne({ anonymousId });
    if (!user) {
      user = new User({ anonymousId });
      await user.save();
    }
    // 現在我們有了用戶實例，無論是否剛剛創建
    userId = user._id;
    // 存入 userId 到 cookie 以便後續使用
    res.cookie('userId', userId.toString(), { httpOnly: true, sameSite: 'lax' });
  }

  // 返回一個表示操作成功的響應
  res.status(200).json({ message: "User identity confirmed", userId , anonymousId});
};


// 核心用戶處理邏輯
exports.processUser = async function({ name, email, googleId, anonymousId }) {
  console.log("processUser");  
  console.log(name+email+anonymousId+googleId);  
  // 確保匿名ID已提供且不為空
    if (!anonymousId || anonymousId.length === 0) {
      throw new Error('必須提供有效的 anonymousId。');
    }
  
    // 如果提供了 googleId，進行檢查確保其唯一
    let user;
    if (googleId) {
      user = await User.findOne({ googleId: googleId });
      console.log("user:" + user);
      if (!user) {
        // 檢查是否存在相同的 anonymousId
        user = await User.findOne({ anonymousId: { $in: anonymousId } });
        if (!user) {
          // 使用 googleId 創建一個新的非匿名用戶
          user = new User({ name, email, googleId, anonymousId, isAnonymous: false });
        } else {
          // 使用 googleId 將現有匿名用戶更新成非匿名用戶，並將 isAnonymous 設置為 false
          user.googleId = googleId;
          user.isAnonymous = false;
          user.email = email;
          user.name = name;
        }
      } else {
        // 檢查是否存在相同的 anonymousId
        userAnunymous = await User.findOne({ anonymousId: { $in: anonymousId } });
        console.log("檢查是否存在相同的 anonymousId");  
        if (userAnunymous && user._id.equals(userAnunymous._id)) {
          // 使用 googleId 更新現有用戶，並將 isAnonymous 設置為 false
          user.isAnonymous = false;
          user.email = email;
          user.name = name;
        } else if (userAnunymous) {
          // 進行帳戶合併
          // 將原本的 anonymousId 移除
          await User.updateOne(
            { _id: userAnunymous._id },
            {
              $pullAll: { anonymousId: userAnunymous.anonymousId },
            }
          );
          console.log("將原本的 anonymousId 移除");  
          // 將 userAnunymous 的 anonymousId 加入 user anonymousId 陣列中
          await User.updateOne(
            { _id: user._id },
            {
              $addToSet: { anonymousId: { $each: userAnunymous.anonymousId } },
              $set: { isAnonymous: false, email: email, name: name }
            }
          ); 
          console.log("將 userAnunymous 的 anonymousId 加入 user anonymousId 陣列中");  
          // 若移除後陣列為空，則移除該 key
          await User.updateOne(
            { _id: userAnunymous._id, anonymousId: { $size: 0 } },
            {
              $unset: { anonymousId: "" }
            }
          );
          console.log("若移除後陣列為空，則移除該 key");  
        }
      }
    } else {
      // 檢查是否存在相同的 anonymousId
      user = await User.findOne({ anonymousId: { $in: anonymousId } });
      if (!user) {
        // 創建一個新的匿名用戶
        user = new User({ anonymousId, isAnonymous: true });
      }
    }
  
    await user.save();
    return user;
  };
  
  // api 專用 createUser，使用 processUser 函數
  exports.createUser = async (req, res) => {
      try {
        const user = await exports.processUser(req.body);
        res.status(201).send(user);
      } catch (error) {
        res.status(500).send({ message: error.message });
      }
  };



  // Get all users
  exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}).sort({ createdAt: -1 });
      res.status(200).send(users);
    } catch (error) {
      res.status(500).send(error);
    }
  };
  
  // 讀取用戶資訊
  exports.getUser = async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).send({ message: '用戶未找到。' });
      }
      res.send(user);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
  
  // 更新用戶資訊
  exports.updateUser = async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).send({ message: '用戶未找到。' });
      }
      updates.forEach((update) => user[update] = req.body[update]);
      await user.save();
      res.send(user);
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
  
  // 刪除用戶
  exports.deleteUser = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.userId);
      if (!user) {
        return res.status(404).send({ message: '用戶未找到。' });
      }
      res.send({ message: '用戶已被刪除。' });
    } catch (error) {
      res.status(500).send({ message: error.message });
    }
  };
