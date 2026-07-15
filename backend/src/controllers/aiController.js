const AIConversation = require('../models/AIConversation');
const Quiz = require('../models/Quiz');
const Profile = require('../models/Profile');
const Progress = require('../models/Progress');
const Notification = require('../models/Notification');
const openaiService = require('../services/openaiService');
const { sendRealTimeNotification } = require('../services/socketService');
const { checkAndAwardBadges } = require('../services/gamificationService');

// @desc    AI Mentor Chatbot
// @route   POST /api/ai/chat
// @access  Private
const chatMentor = async (req, res, next) => {
  const { message, type, conversationId } = req.body; // type: 'mentor', 'career', 'coding', 'mock_interview'

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message' });
  }

  try {
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, user: req.user.id });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        user: req.user.id,
        type: type || 'mentor',
        messages: [],
      });
    }

    // Call service to get AI response
    const reply = await openaiService.chatMentor(conversation.messages, message, conversation.type);

    // Save history
    conversation.messages.push({ role: 'user', content: message, tokensUsed: 100 });
    conversation.messages.push({ role: 'assistant', content: reply, tokensUsed: 250 });
    conversation.totalTokens += 350;
    await conversation.save();

    res.status(200).json({
      success: true,
      reply,
      conversationId: conversation._id,
      messages: conversation.messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI Conversations History
// @route   GET /api/ai/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const conversations = await AIConversation.find({ user: req.user.id }).sort('-updatedAt');
    res.status(200).json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Specific Conversation Details
// @route   GET /api/ai/conversations/:id
// @access  Private
const getConversationById = async (req, res, next) => {
  try {
    const conversation = await AIConversation.findOne({ _id: req.params.id, user: req.user.id });
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }
    res.status(200).json({ success: true, conversation });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Quiz Generator
// @route   POST /api/ai/quiz
// @access  Private
const generateQuizEndpoint = async (req, res, next) => {
  const { topic, difficulty } = req.body;

  if (!topic) {
    return res.status(400).json({ success: false, message: 'Please provide a quiz topic' });
  }

  try {
    const questions = await openaiService.generateQuiz(topic, difficulty || 'Intermediate');

    const quiz = await Quiz.create({
      user: req.user.id,
      title: `${topic} Quiz (${difficulty || 'Intermediate'})`,
      category: topic,
      questions,
      maxScore: questions.length,
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit Quiz Answers
// @route   POST /api/ai/quiz/:id/submit
// @access  Private
const submitQuizAnswers = async (req, res, next) => {
  const { answers } = req.body; // Array of option indexes

  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (quiz.isCompleted) {
      return res.status(400).json({ success: false, message: 'Quiz already completed' });
    }

    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) {
        score++;
      }
    });

    quiz.score = score;
    quiz.answersSubmitted = answers;
    quiz.isCompleted = true;
    await quiz.save();

    // Log progress metrics
    const progress = await Progress.findOne({ user: req.user.id });
    if (progress) {
      progress.completedQuizzesCount += 1;
      progress.points = (progress.points || 0) + score * 2; // 2 points per correct answer
      await progress.save();
    }

    // Award Achievement Notification if score is high
    const passingRate = (score / quiz.maxScore) * 100;
    if (passingRate >= 80) {
      const notif = await Notification.create({
        recipient: req.user.id,
        type: 'achievement',
        title: 'Quiz Mastered! 🌟',
        message: `Outstanding! You scored ${score}/${quiz.maxScore} (${passingRate}%) in "${quiz.title}".`,
        actionUrl: `/achievements`,
      });
      sendRealTimeNotification(req.user.id, notif);
    }

    // Check for newly unlocked quiz-related badges
    const newBadges = await checkAndAwardBadges(req.user.id);

    res.status(200).json({
      success: true,
      score,
      maxScore: quiz.maxScore,
      questions: quiz.questions,
      answersSubmitted: quiz.answersSubmitted,
      newBadges,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Resume Analyzer
// @route   POST /api/ai/resume-analyze
// @access  Private
const analyzeResumeEndpoint = async (req, res, next) => {
  const { resumeText } = req.body;

  if (!resumeText) {
    return res.status(400).json({ success: false, message: 'Please provide resume text to analyze' });
  }

  try {
    const analysis = await openaiService.analyzeResume(resumeText);

    // Save to user profile
    const profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile.resumeAnalysis = analysis;
      await profile.save();
    }

    res.status(200).json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Mock Interview Questions
// @route   GET /api/ai/mock-interview
// @access  Private
const getMockInterviewQuestionsEndpoint = async (req, res, next) => {
  const { role, level } = req.query;

  try {
    const questions = await openaiService.getMockInterviewQuestions(
      role || 'Full Stack Engineer',
      level || 'Intermediate'
    );
    res.status(200).json({ success: true, questions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatMentor,
  getConversations,
  getConversationById,
  generateQuizEndpoint,
  submitQuizAnswers,
  analyzeResumeEndpoint,
  getMockInterviewQuestionsEndpoint,
};
