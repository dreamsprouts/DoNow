const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');

// API to fetch sorted tasks
// Helper function to calculate weight based on the date created and current date
const calculateRecentlyCreatedWeight = (createdAt) => {
  const today = new Date();
  const timeDiff = Math.abs(today.getTime() - createdAt.getTime());
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return 1 / dayDiff; // Simple inverse proportion
};

// Helper function to calculate weight based on the last tracked time
const calculateLastTrackedWeight = (lastTrackedAt) => {
  // 若 lastTrackedAt 為 null 或未定義，直接返回權重為 0
  if (!lastTrackedAt) return 0;
  const today = new Date();
  const timeDiff = Math.abs(today.getTime() - new Date(lastTrackedAt).getTime());
  const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return 1 / dayDiff; // Simple inverse proportion
};

// get sorted tasks by user
router.get('/tasks/sorted/user', async (req, res) => {
  const createdBy = req.cookies.userId; // 或從用戶登入狀態獲取 userId

  try {
    // 僅查詢當前用戶創建的任務
    const tasks = await Task.find({createdBy: createdBy});
    
    // 進行動態權重計算
    tasks.forEach(task => {
      task._doc.recentlyCreatedWeight = calculateRecentlyCreatedWeight(task.createdAt);
      task._doc.lastTrackedWeight = calculateLastTrackedWeight(task.lastTrackedAt);
    });

    // 根據綜合因素進行排序
    tasks.sort((a, b) => {
      const weightA = a.usageCount + calculateRecentlyCreatedWeight(a.createdAt) + calculateLastTrackedWeight(a.lastTrackedAt);
      const weightB = b.usageCount + calculateRecentlyCreatedWeight(b.createdAt) + calculateLastTrackedWeight(b.lastTrackedAt);
      return weightB - weightA; // 降序排序
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// get all sorted tasks
router.get('/tasks/sorted/admin', async (req, res) => {
    try {
      const tasks = await Task.find({});
      // 進行動態權重計算
      tasks.forEach(task => {
        task._doc.recentlyCreatedWeight = calculateRecentlyCreatedWeight(task.createdAt);
        task._doc.lastTrackedWeight = calculateLastTrackedWeight(task.lastTrackedAt);
      });
  
      // Sort the tasks based on the combined factors
      tasks.sort((a, b) => {
        const weightA = a.usageCount + calculateRecentlyCreatedWeight(a.createdAt) + calculateLastTrackedWeight(a.lastTrackedAt);
        const weightB = b.usageCount + calculateRecentlyCreatedWeight(b.createdAt) + calculateLastTrackedWeight(b.lastTrackedAt);
        return weightB - weightA; // Descending sort
      });
  
      res.json(tasks);
    } catch (error) {
      res.status(500).send(error.message);
    }
  });

// Create a new task
router.post('/tasks', async (req, res) => {
    const { taskName } = req.body;
    const createdBy = req.cookies.userId; // 從 cookie 中提取 userId
    try {
      // 檢查是否存在同名的任務且 createdBy 相同
      const existingTask = await Task.findOne({ taskName: taskName, createdBy: createdBy });
  
      if (existingTask) {
        return res.status(409).json({ message: "Task name already exists under this user." });
      }
  
      const task = new Task({ taskName, createdBy });
      await task.save();
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

// Get all tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a task by id
router.get('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a task by id
router.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a task by id
router.put('/tasks/:id', async (req, res) => {
    const { taskName } = req.body;

    try {
      // 首先檢查是否有其他任務已使用了新的 taskName
      const existingTask = await Task.findOne({ taskName: taskName, _id: { $ne: req.params.id } });
  
      if (existingTask) {
        return res.status(409).json({ message: "Task name already exists." });
      }
  
      // 如果沒有衝突，則進行更新
      const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
  
      res.status(200).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
});

// Search for a task by name
router.get('/tasks/search', async (req, res) => {
  try {
    const taskName = req.query.name;
    const createdBy = req.cookies.userId; // 從 cookie 中提取 userId

    const tasks = await Task.find({ 
      createdBy: createdBy,
      taskName: new RegExp(taskName, 'i') 
    });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



module.exports = router;
