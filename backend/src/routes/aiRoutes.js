const express = require('express');
const {
  chatMentor,
  getConversations,
  getConversationById,
  generateQuizEndpoint,
  submitQuizAnswers,
  analyzeResumeEndpoint,
  getMockInterviewQuestionsEndpoint,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/chat', chatMentor);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);

router.post('/quiz', generateQuizEndpoint);
router.post('/quiz/:id/submit', submitQuizAnswers);

router.post('/resume-analyze', analyzeResumeEndpoint);
router.get('/mock-interview', getMockInterviewQuestionsEndpoint);

module.exports = router;
