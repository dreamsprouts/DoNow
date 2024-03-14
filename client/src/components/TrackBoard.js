import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackTaskMenu from './TrackTaskMenu';

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const TrackBoard =  ({ onAddEvent, userIdConfirmed, API })  => {
  const [time, setTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  // Load All Task List By Smart Sorted and by user
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (userIdConfirmed) {  // 僅在 userId 確認後請求任務列表
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
  }, [userIdConfirmed]);  // 依賴 userIdConfirmed 的變化
   

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
