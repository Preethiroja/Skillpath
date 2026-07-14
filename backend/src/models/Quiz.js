const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
  },
  correctAnswerIndex: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const QuizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  questions: [QuizQuestionSchema],
  score: {
    type: Number,
    default: 0,
  },
  maxScore: {
    type: Number,
    default: 10,
  },
  answersSubmitted: {
    type: [Number],
    default: [],
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Quiz', QuizSchema);
