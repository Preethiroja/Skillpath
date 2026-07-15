const CareerAssessment = require('../models/CareerAssessment');
const { ASSESSMENT_QUESTIONS } = require('../data/assessmentQuestions');
const { analyzeCareerAssessment } = require('../services/openaiService');
const { checkAndAwardBadges } = require('../services/gamificationService');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const { sendRealTimeNotification } = require('../services/socketService');

// @desc    Get the static question bank (options only — no "correct" answer to hide)
// @route   GET /api/assessment/questions
// @access  Private
const getQuestions = async (req, res, next) => {
  try {
    const questions = ASSESSMENT_QUESTIONS.map((q) => ({
      id: q.id,
      category: q.category,
      question: q.question,
      options: q.options.map((o) => o.text),
    }));
    res.status(200).json({ success: true, questions, total: questions.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Start a new assessment attempt
// @route   POST /api/assessment/start
// @access  Private
const startAssessment = async (req, res, next) => {
  try {
    const assessment = await CareerAssessment.create({
      user: req.user.id,
      status: 'in_progress',
      answers: [],
    });
    res.status(201).json({ success: true, assessmentId: assessment._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit answers for an assessment and generate the AI report
// @route   POST /api/assessment/:id/submit
// @access  Private
const submitAssessment = async (req, res, next) => {
  const { answers } = req.body;

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide your answers' });
  }

  try {
    const assessment = await CareerAssessment.findOne({ _id: req.params.id, user: req.user.id });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    if (assessment.status === 'completed') {
      return res.status(200).json({ success: true, assessment });
    }

    const validQuestionIds = new Set(ASSESSMENT_QUESTIONS.map((q) => q.id));
    const cleanAnswers = answers.filter(
      (a) => validQuestionIds.has(a.questionId) && Number.isInteger(a.selectedOptionIndex)
    );

    if (cleanAnswers.length < ASSESSMENT_QUESTIONS.length) {
      return res.status(400).json({
        success: false,
        message: `Please answer all ${ASSESSMENT_QUESTIONS.length} questions (received ${cleanAnswers.length})`,
      });
    }

    const report = await analyzeCareerAssessment(cleanAnswers);

    assessment.answers = cleanAnswers;
    assessment.report = report;
    assessment.status = 'completed';
    assessment.completedAt = new Date();
    await assessment.save();

    // Reward engagement: points + a notification, and let badge logic run
    let progress = await Progress.findOne({ user: req.user.id });
    if (!progress) {
      progress = await Progress.create({ user: req.user.id });
    }
    progress.points = (progress.points || 0) + 15;
    await progress.save();

    const notif = await Notification.create({
      recipient: req.user.id,
      type: 'achievement',
      title: 'Career Assessment Complete! 🎯',
      message: `Your top match: ${report.careerRecommendations?.[0]?.career || 'a great career'} (${report.careerRecommendations?.[0]?.confidence || ''}% match). View your full report now.`,
      actionUrl: `/assessment/${assessment._id}/report`,
    });
    sendRealTimeNotification(req.user.id, notif);

    const newBadges = await checkAndAwardBadges(req.user.id);

    res.status(200).json({ success: true, assessment, newBadges });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's past assessments (summary list)
// @route   GET /api/assessment
// @access  Private
const getMyAssessments = async (req, res, next) => {
  try {
    const assessments = await CareerAssessment.find({ user: req.user.id })
      .select('status completedAt createdAt report.careerRecommendations')
      .sort('-createdAt');
    res.status(200).json({ success: true, assessments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get full detail (including report) for one assessment
// @route   GET /api/assessment/:id
// @access  Private
const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await CareerAssessment.findOne({ _id: req.params.id, user: req.user.id });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.status(200).json({ success: true, assessment });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuestions,
  startAssessment,
  submitAssessment,
  getMyAssessments,
  getAssessmentById,
};
