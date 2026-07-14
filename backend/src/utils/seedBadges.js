const Badge = require('../models/Badge');

const defaultBadges = [
  { title: 'First Steps', description: 'Log your very first day of learning activity.', icon: '🌱', conditionType: 'streak', conditionValue: 1 },
  { title: 'On a Roll', description: 'Maintain a 3-day learning streak.', icon: '🔥', conditionType: 'streak', conditionValue: 3 },
  { title: 'Consistency Champion', description: 'Maintain a 7-day learning streak.', icon: '🏅', conditionType: 'streak', conditionValue: 7 },
  { title: 'Unstoppable', description: 'Maintain a 30-day learning streak.', icon: '🚀', conditionType: 'streak', conditionValue: 30 },
  { title: 'Quiz Rookie', description: 'Complete 5 quizzes.', icon: '🧠', conditionType: 'quiz_score', conditionValue: 5 },
  { title: 'Quiz Master', description: 'Complete 20 quizzes.', icon: '🎯', conditionType: 'quiz_score', conditionValue: 20 },
  { title: 'Focused Learner', description: 'Log 60 total minutes of study time.', icon: '⏱️', conditionType: 'timer_spent', conditionValue: 60 },
  { title: 'Deep Work', description: 'Log 600 total minutes of study time.', icon: '⏳', conditionType: 'timer_spent', conditionValue: 600 },
  { title: 'Marathon Mind', description: 'Log 3000 total minutes of study time.', icon: '🧗', conditionType: 'timer_spent', conditionValue: 3000 },
  { title: 'Path Finisher', description: 'Complete your first learning path.', icon: '🎓', conditionType: 'path_completion', conditionValue: 1 },
  { title: 'Path Pro', description: 'Complete 5 learning paths.', icon: '👑', conditionType: 'path_completion', conditionValue: 5 },
];

const seedDefaultBadges = async () => {
  try {
    const count = await Badge.countDocuments();
    if (count === 0) {
      await Badge.insertMany(defaultBadges);
      console.log(`Seeded ${defaultBadges.length} default achievement badges.`);
    }
  } catch (error) {
    console.error('Failed to seed default badges:', error.message);
  }
};

module.exports = { seedDefaultBadges, defaultBadges };
