const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  lastActiveDate: {
    type: Date,
    default: null,
  },
  dailyTimeSpent: [
    {
      date: { type: String }, // Format YYYY-MM-DD
      minutes: { type: Number, default: 0 },
    }
  ],
  totalTimeSpent: {
    type: Number,
    default: 0, // in minutes
  },
  completedCoursesCount: {
    type: Number,
    default: 0,
  },
  completedQuizzesCount: {
    type: Number,
    default: 0,
  },
  completedNodes: {
    type: [String], // Array of node IDs across any paths
    default: [],
  },
  points: {
    type: Number,
    default: 0, // Leaderboard score, earned via study sessions, quizzes, badges
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Progress', ProgressSchema);
