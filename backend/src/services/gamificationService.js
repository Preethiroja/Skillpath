const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');
const Progress = require('../models/Progress');
const LearningPath = require('../models/LearningPath');
const Notification = require('../models/Notification');
const { sendRealTimeNotification } = require('./socketService');

const POINTS_PER_BADGE = 25;

// Checks the user's current progress against every un-earned, auto-awardable
// badge and awards any that now qualify. Returns the list of newly earned badges.
const checkAndAwardBadges = async (userId) => {
  const progress = await Progress.findOne({ user: userId });
  if (!progress) return [];

  const earned = await UserBadge.find({ user: userId }).select('badge');
  const earnedBadgeIds = earned.map((e) => e.badge.toString());

  const candidateBadges = await Badge.find({
    _id: { $nin: earnedBadgeIds },
    conditionType: { $ne: 'custom' },
  });

  if (candidateBadges.length === 0) return [];

  const completedPathsCount = await LearningPath.countDocuments({
    user: userId,
    status: 'completed',
  });

  const newlyAwarded = [];

  for (const badge of candidateBadges) {
    let qualifies = false;

    switch (badge.conditionType) {
      case 'streak':
        qualifies = progress.currentStreak >= badge.conditionValue;
        break;
      case 'timer_spent':
        qualifies = progress.totalTimeSpent >= badge.conditionValue;
        break;
      case 'quiz_score':
        qualifies = progress.completedQuizzesCount >= badge.conditionValue;
        break;
      case 'path_completion':
        qualifies = completedPathsCount >= badge.conditionValue;
        break;
      default:
        qualifies = false;
    }

    if (qualifies) {
      await UserBadge.create({ user: userId, badge: badge._id });
      progress.points = (progress.points || 0) + POINTS_PER_BADGE;
      newlyAwarded.push(badge);

      const notif = await Notification.create({
        recipient: userId,
        type: 'achievement',
        title: `New Badge Earned! ${badge.icon}`,
        message: `You unlocked the "${badge.title}" badge — ${badge.description}`,
        actionUrl: '/badges',
      });
      sendRealTimeNotification(userId, notif);
    }
  }

  if (newlyAwarded.length > 0) {
    await progress.save();
  }

  return newlyAwarded;
};

module.exports = { checkAndAwardBadges, POINTS_PER_BADGE };
