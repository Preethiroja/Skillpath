const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Note',
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
  },
  tags: {
    type: [String],
    default: [],
  },
  pathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    default: null,
  },
  pinned: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

NoteSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('Note', NoteSchema);
