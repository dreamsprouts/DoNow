App.js

import React, { useState, useEffect } from 'react';
import TrackBoard from './components/TrackBoard';
import EventList from './components/EventList';
import Header from './components/Header';
import axios from 'axios';
import './styles/main.scss';

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
axios.defaults.withCredentials = true; //確保所有使用 axios 發出的請求都會自動攜帶 cookies
const App = () => {
  const [events, setEvents] = useState([]);
  const [userIdConfirmed, setUserIdConfirmed] = useState(false); // 新增狀態來追蹤用戶身份是否已確認
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 追蹤用戶登入狀態
  const [isInitialized, setIsInitialized] = useState(false); // 新增狀態來追蹤用戶身份是否已確認


  // 新增一個 useEffect 來處理用戶身份確認
  useEffect(() => {
    const confirmUserId = async () => {
      // 嘗試從後端確認用戶身份，這可能涉及到檢查 cookie，創建新用戶等操作
      try {
        // 假設您有一個後端端點可以執行這個確認過程
        await axios.get(`${API}/api/users/confirm`);
        setUserIdConfirmed(true); // 如果成功，設置 userIdConfirmed 為 true
      } catch (error) {
        console.error('Error confirming user ID:', error);
      }
    };
    apiTest();
    confirmUserId();
  }, []); 

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get(`${API}/api/auth/status`, {
          withCredentials: true // 確保請求時帶上 cookies
        });
        const data = response.data;
        if (data.isLoggedIn) {
          setIsLoggedIn(true); // 登入成功後，更新狀態
          setIsInitialized(true); // 到此步驟完成才能開始進行後續動作
          console.log("isLoggedIn:"+isLoggedIn)
        } else {
          setIsLoggedIn(false); // 未登入或 session 過期
          setIsInitialized(true); // 到此步驟完成才能開始進行後續動作
          console.log("isLoggedIn:"+isLoggedIn)
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false); // 出錯時默認設置為未登入狀態
        setIsInitialized(true); // 到此步驟完成才能開始進行後續動作
        console.log("isLoggedIn:"+isLoggedIn)
      }
    };
    checkLoginStatus();
  }, [userIdConfirmed]);// 依賴於 userIdConfirmed

  useEffect(() => {
    if (isInitialized) {
      fetchEvents(); // 只有在用戶身份被確認後才調用 fetchEvents
    }
  }, [isInitialized]); // 依賴於 isInitialized

  const apiTest = async () => {
    try {
      const response = await axios.get(`${API}/api/events/hi`);
      console.log('API response:', response.data);
    } catch (error) {
      console.error('Error fetching from API:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/api/events/user`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const addEvent = async (newEvent) => {
    try {
      await axios.post(`${API}/api/events`, newEvent, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      fetchEvents(); // refresh the event list after adding new event
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await axios.delete(`${API}/api/events/${eventId}`);
      // 过滤掉被删除的事件，然后设置新的状态来更新UI
      setEvents(events.filter(event => event._id !== eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleLogin = () => {
    // 登入處理，打開 OAuth 登入頁面
    window.location.href = `${API}/auth/google`;
  };

  const handleLogout = () => {
    // 登出處理，可能是向後端發送登出請求，待補上
    // 假定登出成功後，更新狀態
    // setIsLoggedIn(false);
  };

  return (
    <div className="app-container">
      <Header
          onLogin={handleLogin}
          onLogout={handleLogout}
          isInitialized={isInitialized}
          API={API}
        />
      <div className="body-content">
        <TrackBoard onAddEvent={addEvent} isLoggedIn={isLoggedIn} API={API}/>
        <EventList events={events} onDeleteEvent={deleteEvent}/>
      </div>
    </div>
  );
};

export default App;



TrackBoard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackTaskMenu from './TrackTaskMenu';

// const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const TrackBoard =  ({ onAddEvent, isInitialized, API,fetchTasks })  => {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Load All Task List By Smart Sorted and by user
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isInitialized) {  // 僅在 userId 確認後請求任務列表
      const initializeTasks = async () => {
        console.log('Starting to confirm user ID');
        try {
          const response = await axios.get(`${API}/api/tasks/sorted/user`);
          if (response.data && response.data.length > 0) {
            setTasks(response.data);
            setSelectedTaskId(response.data[0]._id);
          }
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
        console.log('Finished confirming user ID');
      };
    
      initializeTasks();
    }
  }, [isInitialized]);  // 依賴 isInitialized 的變化
   

  // 只更新任務列表，不設定選定任務ID
  const fetchTasks = async () => {
    const response = await axios.get(`${API}/api/tasks/sorted/user`);
    setTasks(response.data);
  };


  // create event
  const handleTrack = async () => {
    let taskId = selectedTaskId;
    const event = { trackedAt: time, trackedTask: tasks.find(task => task._id === taskId).taskName };
    onAddEvent(event);
  };

  const refreshTime = () => {
    setTime(new Date());
  };

  return (
    <div className="track-board">
      <div className="track-board__time-display">{time.toLocaleTimeString()}</div>
      <button className="track-board__button" onClick={refreshTime}>REFRESH TIME</button>
      <TrackTaskMenu 
        tasks={tasks} 
        selectedTaskId={selectedTaskId} 
        onTaskChange={setSelectedTaskId} 
        fetchTasks={fetchTasks}
        API={API}
      />
      <button className="track-board__button"  onClick={handleTrack}>TRACK</button>
    </div>
  );
};

export default TrackBoard;



module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        passReqToCallback: true // 允許將 req 傳遞給回調函數
    },
    async (req, accessToken, refreshToken, profile, done) => {
        try {
            const anonymousId = req.cookies.anonymousId; // 從 cookie 中獲取 anonymousId
            const email = profile.emails?.[0]?.value; // 使用可選鏈來嘗試獲取 email，如果不存在則為 undefined
            // 構造一個用戶對象，僅當 email 存在時才添加 email 屬性
            const userPayload = {
                googleId: profile.id,
                name: profile.displayName,
                anonymousId: anonymousId || '' // 確保有值
            };
            if (email) { // 僅當 email 存在時才添加到用戶對象中
                userPayload.email = email;
            }
            const user = await userController.processUser(userPayload);
        done(null, user); // 認證成功，將用戶對象傳遞給 Passport
        } catch (error) {
        done(error, null);
        }
    }
    ));
};