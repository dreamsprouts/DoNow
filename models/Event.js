const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  trackedAt: {
    type: Date,
    required: true
  },
  trackedTask: {
  type: String,
  required: true
  },
  trackedTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;