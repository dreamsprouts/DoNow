import React, { useState,useRef } from 'react';
import axios from 'axios';


const TrackTaskMenu = ({ tasks, selectedTaskId, onTaskChange,fetchTasks,API }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
      setIsExpanded(!isExpanded);
    };
  
    const handleSelect = (taskId) => {
      onTaskChange(taskId);
      setIsExpanded(false); // Close the dropdown after selection
    };
  
    // This function should be inside the TrackTaskMenu component
    const handleAddNewTask = async () => {
        // Check if newTaskName exists in tasks, considering case sensitivity
        const existingTask = tasks.find(task => task.taskName === newTaskName);
        if (existingTask) {
        // If it exists, use the existing task's ID
        onTaskChange(existingTask._id);
        } else {
        // If it doesn't exist, call the API to create the task
        try {
            const response = await axios.post(`${API}/api/tasks`, { taskName: newTaskName }, {
            headers: {
                'Content-Type': 'application/json'
            }
            });
            // Use the newly created task ID
            onTaskChange(response.data._id);
            fetchTasks();
        } catch (error) {
            console.error('Error creating new task:', error);
            // Handle error appropriately
            return;
        }
        }
    
        // Reset the newTaskName and close the dropdown
        setNewTaskName('');
        setIsExpanded(false);
    };
  
    const selectedTaskName = tasks.find(task => task._id === selectedTaskId)?.taskName || '';

    return (
      <div className="track-task-menu" ref={dropdownRef}>
        <div className={`track-task-menu__header ${isExpanded ? 'is-expanded' : ''}`} onClick={toggleDropdown}>
          <div className="track-task-menu__selected-task">{selectedTaskName}</div>
          <div className="track-task-menu__arrow">{isExpanded ? '▲' : '▼'}</div>
        </div>
  
        {isExpanded && (
          <div className="track-task-menu__expandable">
            <div className="track-task-menu__new-task">
              <input
                className="track-task-menu__input"
                placeholder="Enter new task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
              <button className="track-task-menu__button" onClick={handleAddNewTask}>SELECT</button>
            </div>
            <div className="track-task-menu__list">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`track-task-menu__task-item ${selectedTaskId === task._id ? 'selected' : ''}`}
                  onClick={() => handleSelect(task._id)}
                >
                  {task.taskName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default TrackTaskMenu;
  