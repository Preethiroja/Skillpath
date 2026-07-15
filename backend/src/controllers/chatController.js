const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendRealTimeNotification } = require('../services/socketService');

// ==========================================
// CHAT ENDPOINTS
// ==========================================

// @desc    Create or access a Chat thread
// @route   POST /api/chats
// @access  Private
const accessChat = async (req, res, next) => {
  const { recipientId } = req.body;

  if (!recipientId) {
    return res.status(400).json({ success: false, message: 'Please provide recipientId' });
  }

  try {
    // Check if a chat already exists between these users
    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [req.user.id, recipientId] }
    }).populate('participants', 'name email role').populate('lastMessage');

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user.id, recipientId],
        isGroup: false,
      });
      chat = await Chat.findById(chat._id).populate('participants', 'name email role');
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all chat threads for the user
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id
    })
      .populate('participants', 'name email role')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name email role'
        }
      })
      .sort('-updatedAt');

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message history for a specific Chat
// @route   GET /api/chats/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const messages = await Message.find({ chat: req.params.id })
      .populate('sender', 'name email role')
      .sort('createdAt');
    res.status(200).json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message in a Chat
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  const { text, fileUrl, fileType } = req.body;

  if (!text && !fileUrl) {
    return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
  }

  try {
    const chat = await Chat.findOne({ _id: req.params.id, participants: req.user.id });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat thread not found or access denied' });
    }

    const message = await Message.create({
      chat: chat._id,
      sender: req.user.id,
      text: text || '',
      fileUrl: fileUrl || '',
      fileType: fileType || '',
      seenBy: [req.user.id],
    });

    chat.lastMessage = message._id;
    await chat.save();

    const populatedMsg = await Message.findById(message._id).populate('sender', 'name email role');

    // Notify other participants via notification model if they are offline (Socket events are broadcast separately from frontend)
    const recipient = chat.participants.find(p => p.toString() !== req.user.id.toString());
    if (recipient) {
      const notif = await Notification.create({
        recipient,
        sender: req.user.id,
        type: 'mentor_message',
        title: `New message from ${req.user.name}`,
        message: text ? (text.length > 50 ? text.substring(0, 50) + '...' : text) : 'Sent an attachment',
        actionUrl: `/chat`,
      });
      sendRealTimeNotification(recipient, notif);
    }

    res.status(201).json({ success: true, message: populatedMsg });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// NOTIFICATION ENDPOINTS
// ==========================================

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id }).sort('-createdAt');
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user.id });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, message: 'Notification removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get real users the current user can start a support chat with
//          (students see mentors/admins; mentors/admins see everyone else)
// @route   GET /api/chat/contacts
// @access  Private
const getContacts = async (req, res, next) => {
  try {
    const query = req.user.role === 'student'
      ? { role: { $in: ['mentor', 'admin'] } }
      : { _id: { $ne: req.user.id } };

    const users = await User.find(query).select('name email role').limit(50).sort('name');
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  accessChat,
  getChats,
  getMessages,
  sendMessage,
  getNotifications,
  markRead,
  deleteNotification,
  getContacts,
};
