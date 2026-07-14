const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '🏆',
  },
  conditionType: {
    type: String,
    enum: ['streak', 'quiz_score', 'path_completion', 'timer_spent', 'custom'],
    required: true,
  },
  conditionValue: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Badge', BadgeSchema);
