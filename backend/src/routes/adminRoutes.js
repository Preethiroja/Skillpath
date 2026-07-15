const express = require('express');
const {
  getDashboardStats,
  getUsers,
  getUserById,
  updateUserRole,
  resetUserPassword,
  deleteUser,
  getFeedbacks,
  createResource,
  getResources,
  updateResource,
  deleteResource,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Secure entire admin path to admin role only

// Dashboard
router.get('/stats', getDashboardStats);

// Manage Students / Manage Mentors (role-filterable via ?role=student|mentor)
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);

// Manage Feedback
router.get('/feedback', getFeedbacks);

// Manage Resources
router.get('/resources', getResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Manage Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

module.exports = router;
