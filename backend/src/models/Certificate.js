const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  issueDate: {
    type: Date,
    default: Date.now,
  },
  credentialId: {
    type: String,
    required: true,
    unique: true,
  },
  fileUrl: {
    type: String,
    default: '',
  },
  path: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Certificate', CertificateSchema);
