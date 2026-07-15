const crypto = require('crypto');
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const AIConversation = require('../models/AIConversation');
const Feedback = require('../models/Feedback');
const AdminLog = require('../models/AdminLog');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const Progress = require('../models/Progress');
const { getOnlineUsers } = require('../services/socketService');

// @desc    Get Admin Dashboard Stats & Charts
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalMentors = await User.countDocuments({ role: 'mentor' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalPaths = await LearningPath.countDocuments();
    const feedbacksCount = await Feedback.countDocuments();
    const onlineCount = getOnlineUsers().length;

    // Aggregate AI token usage
    const aiStats = await AIConversation.aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
          conversationsCount: { $sum: 1 },
        }
      }
    ]);

    const totalTokensUsed = aiStats[0]?.totalTokens || 0;
    const aiConversationsCount = aiStats[0]?.conversationsCount || 0;

    // Get registration trends (mock analytics representation based on actual database dates)
    const registrations = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalMentors,
        totalAdmins,
        totalPaths,
        feedbacksCount,
        onlineCount,
        totalTokensUsed,
        aiConversationsCount,
      },
      charts: {
        registrations,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Users List (filterable by role, searchable, paginated)
// @route   GET /api/admin/users?role=student&search=&page=1&limit=20
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const query = {};
    if (role && ['student', 'mentor', 'admin'].includes(role)) {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      users,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update User Role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  const { role } = req.body;

  if (!['student', 'mentor', 'admin'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role specify' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'UPDATE_USER_ROLE',
      details: `Updated user ${user.email} role from ${oldRole} to ${role}`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete User Account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    // Log action
    await AdminLog.create({
      admin: req.user.id,
      action: 'DELETE_USER',
      details: `Deleted user ${user.name} (${user.email})`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ success: true, message: 'User account removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin-issued password reset (no email flow exists, so this
//          generates a temporary password the admin can relay out-of-band)
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tempPassword = crypto.randomBytes(6).toString('hex'); // 12-char temp password
    user.password = tempPassword; // hashed automatically by the pre-save hook
    user.refreshToken = null; // force re-login everywhere
    await user.save();

    await AdminLog.create({
      admin: req.user.id,
      action: 'RESET_USER_PASSWORD',
      details: `Reset password for user "${user.email}"`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({
      success: true,
      message: 'Password reset. Share this temporary password with the user directly.',
      tempPassword,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user detail with progress & path summary (for Manage Students/Mentors)
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [progress, pathsCount, completedPathsCount] = await Promise.all([
      Progress.findOne({ user: user._id }),
      LearningPath.countDocuments({ user: user._id }),
      LearningPath.countDocuments({ user: user._id, status: 'completed' }),
    ]);

    res.status(200).json({
      success: true,
      user,
      progress: progress || null,
      pathsCount,
      completedPathsCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Feedback rating lists
// @route   GET /api/admin/feedback
// @access  Private/Admin
const getFeedbacks = async (req, res, next) => {
  try {
    const feedbacks = await Feedback.find().populate('user', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, feedbacks });
  } catch (error) {
    next(error);
  }
};

// @desc    Create/Approve a Course/Resource
// @route   POST /api/admin/resources
// @access  Private/Admin
const createResource = async (req, res, next) => {
  const { title, type, url, description, tags, difficulty } = req.body;

  try {
    const resource = await Resource.create({
      title,
      type,
      url,
      description,
      tags,
      difficulty,
      addedBy: req.user.id,
      isSystemApproved: true,
    });

    res.status(201).json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Resources list (searchable, filterable by type, paginated)
// @route   GET /api/admin/resources?search=&type=&page=1&limit=20
// @access  Private/Admin
const getResources = async (req, res, next) => {
  try {
    const { search, type } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const query = {};
    if (type) query.type = type;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [resources, total] = await Promise.all([
      Resource.find(query).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Resource.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      resources,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a resource
// @route   PUT /api/admin/resources/:id
// @access  Private/Admin
const updateResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const { title, type, url, description, tags, difficulty, duration, isSystemApproved } = req.body;
    if (title !== undefined) resource.title = title;
    if (type !== undefined) resource.type = type;
    if (url !== undefined) resource.url = url;
    if (description !== undefined) resource.description = description;
    if (tags !== undefined) resource.tags = tags;
    if (difficulty !== undefined) resource.difficulty = difficulty;
    if (duration !== undefined) resource.duration = duration;
    if (isSystemApproved !== undefined) resource.isSystemApproved = isSystemApproved;

    await resource.save();

    await AdminLog.create({
      admin: req.user.id,
      action: 'UPDATE_RESOURCE',
      details: `Updated resource "${resource.title}"`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ success: true, resource });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a resource
// @route   DELETE /api/admin/resources/:id
// @access  Private/Admin
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    await AdminLog.create({
      admin: req.user.id,
      action: 'DELETE_RESOURCE',
      details: `Deleted resource "${resource.title}"`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ success: true, message: 'Resource removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Courses list (searchable, filterable by category/level, paginated)
// @route   GET /api/admin/courses?search=&category=&level=&page=1&limit=20
// @access  Private/Admin
const getCourses = async (req, res, next) => {
  try {
    const { search, category, level } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const query = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [courses, total] = await Promise.all([
      Course.find(query).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Course.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      courses,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a course
// @route   POST /api/admin/courses
// @access  Private/Admin
const createCourse = async (req, res, next) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Course title and description are required' });
  }

  try {
    const course = await Course.create(req.body);

    await AdminLog.create({
      admin: req.user.id,
      action: 'CREATE_COURSE',
      details: `Created course "${course.title}"`,
      ipAddress: req.ip || '',
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/admin/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const allowedFields = [
      'title', 'description', 'instructor', 'platform', 'url',
      'rating', 'duration', 'category', 'level', 'thumbnail', 'modules',
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) course[field] = req.body[field];
    });

    await course.save();

    await AdminLog.create({
      admin: req.user.id,
      action: 'UPDATE_COURSE',
      details: `Updated course "${course.title}"`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/admin/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    await AdminLog.create({
      admin: req.user.id,
      action: 'DELETE_COURSE',
      details: `Deleted course "${course.title}"`,
      ipAddress: req.ip || '',
    });

    res.status(200).json({ success: true, message: 'Course removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
