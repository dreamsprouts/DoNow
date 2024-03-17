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
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  // const [userIdConfirmed, setUserIdConfirmed] = useState(false); // 新增狀態來追蹤用戶身份是否已確認
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 追蹤用戶登入狀態
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // 初始化
  useEffect(() => {
    const initialize = async () => {
      try {
        // Step 1: 確認是否有 userId，如果沒有則從後端獲取
        if (!userId) {
          const userIdResponse = await axios.get(`${API}/api/users/confirm`);
          setUserId(userIdResponse.data.userId); // 假設後端回傳 { userId: "someUserId" }
          console.log("Step 1: 確認是否有 userId，如果沒有則從後端獲取");
        }
        
        // Step 2: 檢查登入狀態
        const loginStatusResponse = await axios.get(`${API}/api/auth/status`);
        setIsLoggedIn(loginStatusResponse.data.isLoggedIn);
        console.log("Step 2: 檢查登入狀態 - isLoggedIn="+loginStatusResponse.data.isLoggedIn);
        // Step 3: 加載 event 和 task 列表
        await Promise.all([
          fetchEvents(),
          fetchTasks(),// 假設你有一個 fetchTasks 方法在 TrackBoard 中
          console.log("Step 3: 加載 event 和 task 列表"),
        ]);
        
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };
    initialize();
  }, []); 
  

  // apiTest();
  // const apiTest = async () => {
  //   try {
  //     const response = await axios.get(`${API}/api/events/hi`);
  //     console.log('API response:', response.data);
  //   } catch (error) {
  //     console.error('Error fetching from API:', error);
  //   }
  // };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API}/api/events/user`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // 只更新任務列表，不設定選定任務ID
  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API}/api/tasks/sorted/user`);
      if (response.data && response.data.length > 0) {
        setTasks(response.data);
        if (!selectedTaskId) {
          setSelectedTaskId(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
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

  const handleLogout = async () => {
    try {
      await axios.get(`${API}/auth/logout`); // 向後端發送登出請求
      setIsLoggedIn(false); // 更新狀態為未登入
      setUserId(null); // 清除 userId
      console.log("已登出，IsLoggedIn="+isLoggedIn);
      // 這裡還可以加上導航到登入頁面的代碼，如果您有的話
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  return (
    <div className="app-container">
      <Header
        onLogin={handleLogin}
        onLogout={handleLogout}
        API={API}
        isLoggedIn={isLoggedIn}
      />
      <div className="body-content">
        <TrackBoard 
          onAddEvent={addEvent} 
          API={API}
          fetchTasks={fetchTasks}
          tasks={tasks}
          selectedTaskId={selectedTaskId}
          setSelectedTaskId={setSelectedTaskId}
        />
        <EventList events={events} onDeleteEvent={deleteEvent}/>
      </div>
    </div>
  );
};

export default App;