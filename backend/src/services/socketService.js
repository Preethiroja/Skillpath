const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;
const onlineUsers = new Map(); // userId -> socketId

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware for Socket Connection
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error - No Token Provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_access_secret_key_change_me');
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error - Invalid Token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    console.log(`User connected to Socket.io: ${userId} (${socket.id})`);

    // Let others know this user is online
    socket.broadcast.emit('user_online', { userId });

    // Join personal notification channel
    socket.join(`user_room_${userId}`);

    // Join specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${userId} joined chat room: chat_${chatId}`);
    });

    // Send chat message
    socket.on('send_message', (data) => {
      // data contains: chatId, message { _id, sender, text, fileUrl, createdAt }
      socket.to(`chat_${data.chatId}`).emit('message_received', data);
    });

    // Handle typing status
    socket.on('typing', (data) => {
      // data contains: chatId, isTyping (boolean)
      socket.to(`chat_${data.chatId}`).emit('typing_status', {
        chatId: data.chatId,
        userId,
        isTyping: data.isTyping,
      });
    });

    // Handle message read/seen status
    socket.on('message_seen', (data) => {
      // data contains: chatId, messageIds
      socket.to(`chat_${data.chatId}`).emit('messages_marked_seen', {
        chatId: data.chatId,
        messageIds: data.messageIds,
        seenBy: userId,
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      console.log(`User disconnected from Socket.io: ${userId}`);
      socket.broadcast.emit('user_offline', { userId });
    });
  });

  return io;
};

// Push notification to user
const sendRealTimeNotification = (userId, notification) => {
  if (io) {
    io.to(`user_room_${userId}`).emit('notification_received', notification);
    console.log(`Realtime notification pushed to user room user_room_${userId}`);
  }
};

// Broadcast notification to all
const sendAdminBroadcast = (notification) => {
  if (io) {
    io.emit('notification_received', notification);
    console.log('Realtime notification broadcasted to all users');
  }
};

const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};

module.exports = {
  initSocket,
  sendRealTimeNotification,
  sendAdminBroadcast,
  getOnlineUsers,
};
