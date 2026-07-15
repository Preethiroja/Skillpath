const Progress = require('../models/Progress');

// @desc    Get the top learners leaderboard, ranked by points
// @route   GET /api/student/leaderboard?limit=20
// @access  Private
const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const allProgress = await Progress.find()
      .sort({ points: -1, currentStreak: -1, totalTimeSpent: -1 })
      .populate('user', 'name role');

    const studentsOnly = allProgress.filter((p) => p.user && p.user.role !== 'admin');

    const leaderboard = studentsOnly.slice(0, limit).map((p, idx) => ({
      rank: idx + 1,
      userId: p.user._id,
      name: p.user.name,
      points: p.points || 0,
      currentStreak: p.currentStreak,
      totalTimeSpent: p.totalTimeSpent,
      completedCoursesCount: p.completedCoursesCount,
    }));

    const myIndex = studentsOnly.findIndex(
      (p) => p.user && p.user._id.toString() === req.user.id
    );

    res.status(200).json({
      success: true,
      leaderboard,
      myRank: myIndex >= 0 ? myIndex + 1 : null,
      totalRanked: studentsOnly.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };
