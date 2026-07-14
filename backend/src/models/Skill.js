const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a skill name'],
    unique: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please specify a category (e.g., Frontend, Backend, Data Science)'],
  },
  description: {
    type: String,
    default: '',
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Skill', SkillSchema);
