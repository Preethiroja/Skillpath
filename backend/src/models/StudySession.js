const mongoose = require('mongoose');

const StudySessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mode: {
    type: String,
    enum: ['pomodoro', 'stopwatch', 'custom'],
    default: 'pomodoro',
  },
  durationMinutes: {
    type: Number,
    required: [true, 'Please provide session duration in minutes'],
    min: 1,
  },
  label: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

StudySessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('StudySession', StudySessionSchema);
