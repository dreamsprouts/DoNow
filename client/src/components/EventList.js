import React from 'react';

const EventList = ({ events,onDeleteEvent }) => {

  return (
    <div className="event-list">
      {events.map((event) => (
        <div key={event._id} className="event-list__item">
          <div className="event-list__item__time">{new Date(event.trackedAt).toLocaleTimeString()}</div>
          <div className="event-list__item__task">{event.trackedTask}</div>
          <button
            className="event-list__item__delete"
            onClick={() => onDeleteEvent(event._id)}
          >
            －
          </button>
        </div>
      ))}
    </div>
  );
};

export default EventList;
