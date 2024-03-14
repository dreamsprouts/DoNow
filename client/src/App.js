import React, { useState, useEffect } from 'react';
import TrackBoard from './components/TrackBoard';
import EventList from './components/EventList';
import axios from 'axios';
import './styles/main.scss';

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
axios.defaults.withCredentials = true; //確保所有使用 axios 發出的請求都會自動攜帶 cookies
const App = () => {
  const [events, setEvents] = useState([]);
  const [userIdConfirmed, setUserIdConfirmed] = useState(false); // 新增狀態來追蹤用戶身份是否已確認

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
    if (userIdConfirmed) {
      fetchEvents(); // 只有在用戶身份被確認後才調用 fetchEvents
    }
  }, [userIdConfirmed]); // 依賴於 userIdConfirmed

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

  return (
    <div className="app-container">
      <div>
        <TrackBoard onAddEvent={addEvent} userIdConfirmed={userIdConfirmed} API={API}/>
        <EventList events={events} onDeleteEvent={deleteEvent}/>
      </div>
    </div>
  );
};

export default App;
