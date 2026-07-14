const mongoose = require('mongoose');

const CareerGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a career goal title'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  targetSkills: {
    type: [String],
    default: [],
  },
  targetDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in_progress', 'achieved'],
    default: 'in_progress',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CareerGoal', CareerGoalSchema);
