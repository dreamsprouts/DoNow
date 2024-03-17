import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TrackTaskMenu from './TrackTaskMenu';

// const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const TrackBoard =  ({ onAddEvent, API,fetchTasks,tasks,selectedTaskId,setSelectedTaskId })  => {
  const [time, setTime] = useState(new Date());

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
