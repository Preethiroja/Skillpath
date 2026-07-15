const express = require('express');
const {
  accessChat,
  getChats,
  getMessages,
  sendMessage,
  getNotifications,
  markRead,
  deleteNotification,
  getContacts,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Contacts (list of real users eligible to start a support chat with)
router.get('/contacts', getContacts);

// Chat endpoints
router.route('/chats')
  .post(accessChat)
  .get(getChats);

router.route('/chats/:id/messages')
  .get(getMessages)
  .post(sendMessage);

// Notification endpoints
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
