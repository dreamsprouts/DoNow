const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    lastTrackedAt: Date,
    taskName: { 
        type: String, 
        required: true,
       
    },
    usageCount: {
        type: Number,
        default: 0 // 預設追蹤次數為 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// 創建一個複合索引來保證同一用戶下的 taskName 唯一性
taskSchema.index({ taskName: 1, createdBy: 1 }, { unique: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
