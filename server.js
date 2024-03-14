const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const session = require('express-session');
// const passport = require('./auth/passportSetup');


const app = express();

// Replace the following with your MongoDB connection string
const MONGO_URI = `mongodb://dreamsprouts:${process.env.DB_PASSWORD}@ac-llqwzev-shard-00-00.eoypmtj.mongodb.net:27017,ac-llqwzev-shard-00-01.eoypmtj.mongodb.net:27017,ac-llqwzev-shard-00-02.eoypmtj.mongodb.net:27017/?ssl=true&replicaSet=atlas-lccgsh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
mongoose.connect(MONGO_URI).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const db = mongoose.connection;
db.once('open', _ => {
  console.log('Database connected:', MONGO_URI);
});
db.on('error', err => {
  console.error('connection error:', err);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 引入路由檔案
const eventRoutes = require('./routes/events');
const taskRoutes = require('./routes/tasks'); 
const usersRoutes = require('./routes/users');
// const authRoutes = require('./auth/authRoutes');

// 中間件
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // 請替換成您的前端地址
  credentials: true, // 允許跨域請求中攜帶Cookies
}));
app.use(session({
  secret: process.env.SESSION_SECRET, // 用於簽名 session ID 的密鑰，應當保密
  resave: false,
  saveUninitialized: false,
  cookie: { secure: 'auto', httpOnly: true } // secure: true 在 HTTPS 環境下使用
}));
// app.use(passport.initialize());

// 使用路由中間件
app.use('/api', eventRoutes);
app.use('/api', taskRoutes); 
app.use('/api', usersRoutes);
// app.use(authRoutes);

// 預設路由
app.get('/', (req, res) => {
  res.send('Hello World!');
});




