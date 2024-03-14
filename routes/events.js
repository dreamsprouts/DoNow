const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Task = require('../models/Task');
const User = require('../models/User');

// Get Hi
router.get('/events/hi', (req, res) => {
  res.status(200).send("Hi!");
});


// Create event
router.post('/events', async (req, res) => {
  try {
    const { trackedAt, trackedTask } = req.body;
    const createdBy = req.cookies.userId; // 從 cookie 中提取 userId
    
    // 根據 CreatedBy 查找或創建任務、更新任務的相關參數
    let task = await Task.findOne({ taskName: trackedTask, createdBy });
    if (!task) {
      task = new Task({ taskName: trackedTask, lastTrackedAt: trackedAt, usageCount: 1, createdBy });
    } else {
      task.lastTrackedAt = trackedAt;
      task.usageCount = (task.usageCount || 0) + 1;
    }
    await task.save();


    // 使用 taskId 和 createdBy 創建事件
    const event = new Event({ 
      trackedAt, 
      trackedTask: trackedTask, 
      trackedTaskId: task._id,
      createdBy 
    });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// Get events with Task details populated by user
router.get('/events/user', async (req, res) => {
  const createdBy = req.cookies.userId; // 根據用戶
  try {
    const events = await Event.find({createdBy}).populate('trackedTaskId').sort({ trackedAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Get events with Task details populated
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().populate('trackedTaskId').sort({ trackedAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});



// Get event by id with Task details populated
router.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('trackedTaskId');
    if (!event) {
      return res.status(404).json({ message: 'No event found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// Delete event by id
router.delete('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (event) {
      const task = await Task.findById(event.trackedTaskId);
      if (task) {
        task.usageCount = (task.usageCount || 1) - 1;
        if (task.usageCount <= 0) {
          task.usageCount = 0; // 或者選擇刪除 lastTrackedAt 欄位或設為特定值
        }
        await task.save();
      }
      await Event.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Event deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Event not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event by id
router.put('/events/:id', async (req, res) => {
  try {
    const { trackedAt, trackedTask } = req.body;
    
    // 查找或創建任務
    let task = await Task.findOne({ taskName: trackedTask });
    if (!task) {
      task = new Task({ taskName });
      await task.save();
    }

    const event = await Event.findByIdAndUpdate(req.params.id, { 
      trackedAt, 
      trackedTask: trackedTask,
      trackedTaskId: task._id 
    }, { new: true });

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



module.exports = router;
