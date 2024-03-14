const mongoose = require('mongoose');
const Event = require('./models/Event');
const Task = require('./models/Task');

async function main() {
  try {
    // ...您的連接代碼...
    const MONGO_URI = `mongodb://dreamsprouts:otane428@ac-llqwzev-shard-00-00.eoypmtj.mongodb.net:27017,ac-llqwzev-shard-00-01.eoypmtj.mongodb.net:27017,ac-llqwzev-shard-00-02.eoypmtj.mongodb.net:27017/?ssl=true&replicaSet=atlas-lccgsh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
      await mongoose.connect(MONGO_URI).then(() => console.log('Connected to MongoDB'))
      .catch(err => console.error('Could not connect to MongoDB...', err));
    
    const db = mongoose.connection;
    db.once('open', _ => {
      console.log('Database connected:', MONGO_URI);
    });
    db.on('error', err => {
      console.error('connection error:', err);
    });

    // 使用聚合管道計算每個任務的使用次數和最後追蹤時間
    const usageCounts = await Event.aggregate([
      { $group: {
        _id: '$trackedTask', // 根據 trackedTask 分組
        lastTrackedAt: { $max: '$trackedAt' }, // 找到每個任務最後被追蹤的時間
        count: { $sum: 1 } // 計算每個任務的事件數量
      }}
    ]);

    for (const { _id: taskName, lastTrackedAt, count } of usageCounts) {
      let task = await Task.findOne({ taskName });
      if (task) {
        // 如果任務存在，更新它的使用次數和最後追蹤時間
        task.lastTrackedAt = lastTrackedAt;
        task.usageCount = count;
        await task.save();
      }
    }

    console.log('遷移完成');
  } catch (err) {
    console.error('遷移過程中出現錯誤:', err);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB 連接已關閉');
  }
}

main();
