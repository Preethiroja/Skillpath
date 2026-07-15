const StudySession = require('../models/StudySession');
const Progress = require('../models/Progress');
const { checkAndAwardBadges } = require('../services/gamificationService');

const POINTS_PER_5_MIN = 1;

// @desc    Log a completed study/Pomodoro session and update aggregate progress
// @route   POST /api/student/timer/session
// @access  Private
const logSession = async (req, res, next) => {
  const { durationMinutes, mode, label } = req.body;

  if (!durationMinutes || durationMinutes <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid session duration in minutes',
    });
  }

  try {
    const session = await StudySession.create({
      user: req.user.id,
      durationMinutes,
      mode: mode || 'pomodoro',
      label: label || '',
    });

    let progress = await Progress.findOne({ user: req.user.id });
    if (!progress) {
      progress = await Progress.create({ user: req.user.id });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const todayEntry = progress.dailyTimeSpent.find((d) => d.date === todayStr);
    if (todayEntry) {
      todayEntry.minutes += durationMinutes;
    } else {
      progress.dailyTimeSpent.push({ date: todayStr, minutes: durationMinutes });
    }

    progress.totalTimeSpent += durationMinutes;
    progress.points = (progress.points || 0) + Math.round(durationMinutes / 5) * POINTS_PER_5_MIN;

    // Maintain streak the same way path-node completion does
    if (progress.lastActiveDate) {
      const lastDateStr = progress.lastActiveDate.toISOString().split('T')[0];
      if (lastDateStr !== todayStr) {
        const diffDays = Math.ceil(
          Math.abs(new Date(todayStr) - new Date(lastDateStr)) / (1000 * 60 * 60 * 24)
        );
        if (diffDays === 1) {
          progress.currentStreak += 1;
        } else if (diffDays > 1) {
          progress.currentStreak = 1;
        }
      }
    } else {
      progress.currentStreak = 1;
    }
    progress.lastActiveDate = new Date();

    await progress.save();

    const newBadges = await checkAndAwardBadges(req.user.id);

    res.status(201).json({
      success: true,
      session,
      totalTimeSpent: progress.totalTimeSpent,
      currentStreak: progress.currentStreak,
      points: progress.points,
      newBadges,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get study timer stats: today's minutes, streak, last 7 days, recent sessions
// @route   GET /api/student/timer/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const progress = await Progress.findOne({ user: req.user.id });
    const sessions = await StudySession.find({ user: req.user.id }).sort('-createdAt').limit(50);

    const todayStr = new Date().toISOString().split('T')[0];
    const todayMinutes = progress?.dailyTimeSpent.find((d) => d.date === todayStr)?.minutes || 0;
    const last7Days = progress?.dailyTimeSpent.slice(-7) || [];

    res.status(200).json({
      success: true,
      todayMinutes,
      totalTimeSpent: progress?.totalTimeSpent || 0,
      currentStreak: progress?.currentStreak || 0,
      points: progress?.points || 0,
      last7Days,
      recentSessions: sessions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { logSession, getStats };
