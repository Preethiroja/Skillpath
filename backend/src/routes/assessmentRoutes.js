const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getQuestions,
  startAssessment,
  submitAssessment,
  getMyAssessments,
  getAssessmentById,
} = require('../controllers/assessmentController');

const router = express.Router();

router.use(protect);

router.get('/questions', getQuestions);
router.post('/start', startAssessment);
router.post('/:id/submit', submitAssessment);
router.get('/', getMyAssessments);
router.get('/:id', getAssessmentById);

module.exports = router;
