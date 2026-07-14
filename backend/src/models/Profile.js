const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
  },
  currentTitle: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  educationLevel: {
    type: String,
    enum: ['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Self-Taught', 'Other'],
    default: 'Bachelor\'s Degree',
  },
  interests: {
    type: [String],
    default: [],
  },
  weeklyCommitmentHours: {
    type: Number,
    default: 10,
  },
  preferredLanguage: {
    type: String,
    default: 'English',
  },
  notificationPreferences: {
    achievement: { type: Boolean, default: true },
    certificate: { type: Boolean, default: true },
    mentorMessage: { type: Boolean, default: true },
    reminder: { type: Boolean, default: true },
  },
  githubProfile: {
    type: String,
    default: '',
  },
  linkedinProfile: {
    type: String,
    default: '',
  },
  resumeUrl: {
    type: String,
    default: '',
  },
  resumeAnalysis: {
    skillsFound: [String],
    skillsGaps: [String],
    formattingScore: Number,
    recommendations: String,
    feedback: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Profile', ProfileSchema);
