const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController'); 

router.get('/users/confirm', userController.confirmUserIdentity);

// CRUD Operations
router.post('/users', userController.createUser); // 建立用戶
router.get('/users', userController.getAllUsers); // 讀取所有用戶
router.get('/users/:userId', userController.getUser); // 讀取用戶
router.put('/users/:userId', userController.updateUser); // 更新用戶
router.delete('/users/:userId', userController.deleteUser); // 刪除用戶

module.exports = router;
