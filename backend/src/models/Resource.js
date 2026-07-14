const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a resource title'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['video', 'book', 'article', 'documentation', 'github_project', 'practice_problem', 'coding_challenge'],
    required: true,
  },
  url: {
    type: String,
    required: [true, 'Please add a resource URL'],
  },
  description: {
    type: String,
    default: '',
  },
  tags: {
    type: [String],
    default: [],
  },
  duration: {
    type: String, // e.g. "15 mins", "300 pages"
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All'],
    default: 'All',
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isSystemApproved: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Resource', ResourceSchema);
