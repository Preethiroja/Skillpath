const mongoose = require('mongoose');

const PathNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['course', 'quiz', 'project', 'article', 'video'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['locked', 'unlocked', 'completed'],
    default: 'locked',
  },
  resourceRef: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'nodes.resourceModel',
  },
  resourceModel: {
    type: String,
    enum: ['Course', 'Resource', 'Quiz'],
    default: 'Resource',
  },
  completedAt: {
    type: Date,
  },
});

const LearningPathSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a learning path title'],
  },
  description: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  currentProgress: {
    type: Number,
    default: 0, // percentage 0-100
  },
  nodes: [PathNodeSchema],
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('LearningPath', LearningPathSchema);
