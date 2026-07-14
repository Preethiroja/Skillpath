const mongoose = require('mongoose');

const CareerAssessmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed'],
    default: 'in_progress',
  },
  answers: [{
    questionId: { type: String, required: true },
    selectedOptionIndex: { type: Number, required: true },
  }],
  report: {
    personalitySummary: { type: String, default: '' },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    learningStyle: { type: String, default: '' },
    skillProfile: { type: [String], default: [] },
    interestProfile: { type: [String], default: [] },
    careerRecommendations: [{
      career: { type: String },
      confidence: { type: Number, min: 0, max: 100 },
      reasoning: { type: String, default: '' },
      suggestedSkills: { type: [String], default: [] },
    }],
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

CareerAssessmentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('CareerAssessment', CareerAssessmentSchema);
