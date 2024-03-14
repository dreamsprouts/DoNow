const mongoose = require('mongoose');
const Task = require('../models/Task');

const defaultCreatedById = "65f2726aad94e6feb75439ac";
const mongoDBUri = `mongodb://dreamsprouts:otane428@ac-llqwzev-shard-00-00.eoypmtj.mongodb.net:27017,ac-llqwzev-shard-00-01.eoypmtj.mongodb.net:27017,ac-llqwzev-shard-00-02.eoypmtj.mongodb.net:27017/?ssl=true&replicaSet=atlas-lccgsh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(mongoDBUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const migrateTasks = async () => {
  try {
    // 尋找所有 createdBy 為空或不存在的 Task 文檔
    const tasksToUpdate = await Task.find({ createdBy: { $exists: false } });

    // 如果沒有任務需要更新，則退出
    if (tasksToUpdate.length === 0) {
      console.log('No tasks to update.');
      return;
    }

    // 更新這些任務，將 createdBy 設置為 defaultCreatedById
    const bulkOperations = tasksToUpdate.map(task => {
      return {
        updateOne: {
          filter: { _id: task._id },
          update: { $set: { createdBy: defaultCreatedById } }
        }
      };
    });

    // 執行批量操作
    const result = await Task.bulkWrite(bulkOperations);
    console.log(`Updated tasks: ${result.modifiedCount}`);
  } catch (err) {
    console.error('Error updating tasks:', err);
  } finally {
    // 斷開與數據庫的連接
    mongoose.disconnect();
  }
};

migrateTasks();
