const Badge = require('../models/Badge');
const UserBadge = require('../models/UserBadge');

// @desc    Get all badges in the catalog, flagged with the current user's earned status
// @route   GET /api/student/badges
// @access  Private
const getAllBadges = async (req, res, next) => {
  try {
    const [badges, earned] = await Promise.all([
      Badge.find().sort('conditionValue'),
      UserBadge.find({ user: req.user.id }),
    ]);

    const earnedMap = new Map(earned.map((e) => [e.badge.toString(), e.earnedAt]));

    const result = badges.map((b) => ({
      _id: b._id,
      title: b.title,
      description: b.description,
      icon: b.icon,
      conditionType: b.conditionType,
      conditionValue: b.conditionValue,
      earned: earnedMap.has(b._id.toString()),
      earnedAt: earnedMap.get(b._id.toString()) || null,
    }));

    res.status(200).json({
      success: true,
      badges: result,
      earnedCount: earned.length,
      totalCount: badges.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllBadges };
