const mongoose = require('mongoose');

const ModuleSchema = new mongoose.Schema({
  title: String,
  description: String,
  durationMinutes: Number,
  videoUrl: String,
});

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a course title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  instructor: {
    type: String,
    default: 'SkillPath AI Creator',
  },
  platform: {
    type: String,
    enum: ['YouTube', 'Udemy', 'Coursera', 'Internal', 'Other'],
    default: 'Internal',
  },
  url: {
    type: String,
    default: '',
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  duration: {
    type: String, // e.g. "12 hours"
    default: '2 hours',
  },
  category: {
    type: String,
    default: 'General',
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels',
  },
  thumbnail: {
    type: String,
    default: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400',
  },
  modules: [ModuleSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', CourseSchema);
