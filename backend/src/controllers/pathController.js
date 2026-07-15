const crypto = require('crypto');
const LearningPath = require('../models/LearningPath');
const CareerGoal = require('../models/CareerGoal');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Resource = require('../models/Resource');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { generateLearningPath } = require('../services/openaiService');
const { sendRealTimeNotification } = require('../services/socketService');
const { checkAndAwardBadges } = require('../services/gamificationService');

// The AI service returns free-form JSON; these guard against it drifting
// outside the schema's enums (e.g. a node "type" of "tutorial" or "reading"
// instead of one of the five allowed values), which would otherwise throw a
// Mongoose ValidationError and surface to the user as an opaque 400/500.
const VALID_NODE_TYPES = ['course', 'quiz', 'project', 'article', 'video'];
const VALID_NODE_STATUSES = ['locked', 'unlocked', 'completed'];
const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const sanitizeNodeType = (type) => {
  const normalized = String(type || '').toLowerCase().trim();
  return VALID_NODE_TYPES.includes(normalized) ? normalized : 'article';
};

const sanitizeNodeStatus = (status, index) => {
  const normalized = String(status || '').toLowerCase().trim();
  if (VALID_NODE_STATUSES.includes(normalized)) return normalized;
  return index === 0 ? 'unlocked' : 'locked';
};

const sanitizeDifficulty = (difficulty) => {
  const match = VALID_DIFFICULTIES.find(
    (d) => d.toLowerCase() === String(difficulty || '').toLowerCase().trim()
  );
  return match || 'Beginner';
};

// PathNode.type (['course','quiz','project','article','video']) and
// Resource.type (['video','book','article','documentation','github_project',
// 'practice_problem','coding_challenge']) are two different enums that only
// coincidentally overlap on 'article'/'video'. Passing a raw node type like
// 'quiz' or 'project' straight into Resource.create() throws a Mongoose
// ValidationError ("`quiz` is not a valid enum value for path `type`").
const NODE_TYPE_TO_RESOURCE_TYPE = {
  course: 'video',
  quiz: 'practice_problem',
  project: 'github_project',
  article: 'article',
  video: 'video',
};

const toResourceType = (nodeType) => NODE_TYPE_TO_RESOURCE_TYPE[nodeType] || 'article';

// Helper to seed dynamic resources on the fly if none exist
const getOrCreateResource = async (nodeTitle, type) => {
  const cleanTitle = nodeTitle.trim();
  let resource = await Resource.findOne({ title: cleanTitle });
  if (!resource) {
    const resourceType = toResourceType(type);
    let url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(cleanTitle);
    if (type === 'project') url = 'https://github.com/trending';
    resource = await Resource.create({
      title: cleanTitle,
      type: resourceType,
      url,
      description: `Recommended resource covering: ${nodeTitle}`,
      tags: [type, 'auto-generated'],
      difficulty: 'All',
    });
  }
  return resource;
};

// @desc    Create Career Goal
// @route   POST /api/paths/goal
// @access  Private
const createCareerGoal = async (req, res, next) => {
  const { title, description, targetSkills, targetDate } = req.body;

  try {
    const goal = await CareerGoal.create({
      user: req.user.id,
      title,
      description,
      targetSkills,
      targetDate,
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Career Goals
// @route   GET /api/paths/goals
// @access  Private
const getCareerGoals = async (req, res, next) => {
  try {
    const goals = await CareerGoal.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Personalized Learning Path via AI
// @route   POST /api/paths/generate
// @access  Private
const generatePath = async (req, res, next) => {
  const { title, level, commitmentHours } = req.body;
  const targetSkills = Array.isArray(req.body.targetSkills)
    ? req.body.targetSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const currentSkills = Array.isArray(req.body.currentSkills)
    ? req.body.currentSkills.map((s) => String(s).trim()).filter(Boolean)
    : [];

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Please provide a path title (your target role)' });
  }
  if (targetSkills.length === 0) {
    return res.status(400).json({ success: false, message: 'Please provide at least one target skill' });
  }

  try {
    // Generate JSON roadmap using OpenAI service (with mock fallback built-in)
    const rawPath = await generateLearningPath(
      title,
      targetSkills,
      currentSkills || [],
      level || 'Beginner',
      commitmentHours || 10
    );

    if (!rawPath || !Array.isArray(rawPath.nodes) || rawPath.nodes.length === 0) {
      return res.status(502).json({
        success: false,
        message: 'The AI service returned an unusable roadmap. Please try again.',
      });
    }

    // Resolve or create resources for each node in the generated path
    const resolvedNodes = [];
    rawPath.nodes.forEach((node, index) => {
      resolvedNodes.push({
        ...node,
        id: node.id || `node-${index + 1}`,
        title: node.title || `Step ${index + 1}`,
        type: sanitizeNodeType(node.type),
        status: sanitizeNodeStatus(node.status, index),
      });
    });

    const nodesWithResources = [];
    for (const node of resolvedNodes) {
      const resource = await getOrCreateResource(node.title, node.type);
      nodesWithResources.push({
        id: node.id,
        type: node.type,
        title: node.title,
        description: node.description || '',
        status: node.status,
        resourceRef: resource._id,
        resourceModel: 'Resource',
      });
    }

    const path = await LearningPath.create({
      user: req.user.id,
      title: rawPath.title || title,
      description: rawPath.description || '',
      difficulty: sanitizeDifficulty(rawPath.difficulty),
      nodes: nodesWithResources,
      currentProgress: 0,
      status: 'not_started',
    });

    res.status(201).json({ success: true, path });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All User Paths
// @route   GET /api/paths
// @access  Private
const getPaths = async (req, res, next) => {
  try {
    const paths = await LearningPath.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, paths });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Specific Learning Path
// @route   GET /api/paths/:id
// @access  Private
const getPathById = async (req, res, next) => {
  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user.id }).populate('nodes.resourceRef');
    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }
    res.status(200).json({ success: true, path });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Path Node Status (Complete / Unlock)
// @route   PUT /api/paths/:id/node/:nodeId
// @access  Private
const toggleNodeStatus = async (req, res, next) => {
  const { status } = req.body; // 'completed' or 'locked' or 'unlocked'

  try {
    const path = await LearningPath.findOne({ _id: req.params.id, user: req.user.id });
    if (!path) {
      return res.status(404).json({ success: false, message: 'Learning path not found' });
    }

    const nodeIndex = path.nodes.findIndex(n => n.id === req.params.nodeId);
    if (nodeIndex === -1) {
      return res.status(404).json({ success: false, message: 'Node not found in learning path' });
    }

    const node = path.nodes[nodeIndex];
    const oldStatus = node.status;
    node.status = status;

    if (status === 'completed') {
      node.completedAt = new Date();
      // Unlock next node automatically if it was locked
      if (nodeIndex + 1 < path.nodes.length && path.nodes[nodeIndex + 1].status === 'locked') {
        path.nodes[nodeIndex + 1].status = 'unlocked';
      }
    } else {
      node.completedAt = undefined;
    }

    // Update Progress percentage
    const completedCount = path.nodes.filter(n => n.status === 'completed').length;
    path.currentProgress = Math.round((completedCount / path.nodes.length) * 100);
    path.status = path.currentProgress === 100 ? 'completed' : 'in_progress';

    await path.save();

    // Update User Progress history
    const progress = await Progress.findOne({ user: req.user.id });
    if (progress) {
      // Manage node completed logging
      if (status === 'completed' && !progress.completedNodes.includes(req.params.nodeId)) {
        progress.completedNodes.push(req.params.nodeId);
      } else if (status !== 'completed') {
        progress.completedNodes = progress.completedNodes.filter(id => id !== req.params.nodeId);
      }

      // Update active streak
      const todayStr = new Date().toISOString().split('T')[0];
      if (progress.lastActiveDate) {
        const lastDateStr = progress.lastActiveDate.toISOString().split('T')[0];
        if (lastDateStr !== todayStr) {
          const diffTime = Math.abs(new Date(todayStr) - new Date(lastDateStr));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    }

    // Issue Certificate if completed
    let certificate = null;
    if (path.currentProgress === 100 && oldStatus !== 'completed') {
      const credentialId = `CERT-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString().slice(-4)}`;
      certificate = await Certificate.create({
        user: req.user.id,
        title: `Certificate of Completion: ${path.title}`,
        description: `Issued for completing the personalized SkillPath AI route: ${path.title}.`,
        credentialId,
        path: path._id,
        fileUrl: `https://api.skillpath.ai/certificates/${credentialId}.pdf`,
      });

      // Send System Notification
      const notif = await Notification.create({
        recipient: req.user.id,
        type: 'certificate',
        title: 'Learning Path Completed! 🎓',
        message: `Congratulations! You have completed "${path.title}" and earned a Certificate of Completion!`,
        actionUrl: `/certificates`,
      });
      sendRealTimeNotification(req.user.id, notif);
    }

    // Check for newly unlocked achievement badges (streak / path completion)
    const newBadges = await checkAndAwardBadges(req.user.id);

    res.status(200).json({ success: true, path, certificate, newBadges });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCareerGoal,
  getCareerGoals,
  generatePath,
  getPaths,
  getPathById,
  toggleNodeStatus,
};
