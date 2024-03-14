const mongoose = require('mongoose');
const Event = require('../models/Event');
const Task = require('../models/Task');





async function main() {
    try {
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
  
      const events = await Event.find();
      console.log(`找到 ${events.length} 個事件`);


  // 驗證事件中的 trackedTask 值
  events.forEach((event, index) => {
    console.log(`事件 #${index + 1} 的 trackedTask: `, event.trackedTask);
  });
  
      const uniqueTaskNames = [...new Set(events.map(event => event.trackedTask).filter(Boolean))];
      console.log(`找到 ${uniqueTaskNames.length} 個獨特任務名稱`);
  
      for (const taskName of uniqueTaskNames) {
        let task = await Task.findOne({ taskName: taskName });
        if (!task) {
          console.log(`創建任務: ${taskName}`);
          task = new Task({ taskName });
          await task.save();
        } else {
          console.log(`找到現有任務: ${taskName}`);
        }
  
        const result = await Event.updateMany(
          { trackedTask: taskName },
          { $set: { trackedTaskId: task._id } }
        );
        console.log(`更新了 ${result.nModified} 個事件的 trackedTask`);
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