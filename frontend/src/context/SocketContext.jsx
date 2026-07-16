import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import {
  receiveMessage,
  setTypingState,
  userJoinedOnline,
  userLeftOffline,
  setOnlineUsers
} from '../store/slices/chatSlice';
import { addNotification } from '../store/slices/notificationSlice';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const newSocket = io(import.meta.env.VITE_WS_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to real-time notification socket gateway');
    });

    // Receive message
    newSocket.on('message_received', (data) => {
      dispatch(receiveMessage(data));
    });

    // Receive typing indicator
    newSocket.on('typing_status', (data) => {
      dispatch(setTypingState(data));
    });

    // Receive notifications
    newSocket.on('notification_received', (notif) => {
      dispatch(addNotification(notif));
      // Show toaster alert
      toast.info(notif.message, {
        position: 'top-right',
        autoClose: 5000,
      });
    });

    // Online status
    newSocket.on('user_online', (data) => {
      dispatch(userJoinedOnline(data.userId));
    });

    newSocket.on('user_offline', (data) => {
      dispatch(userLeftOffline(data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, dispatch]);

  const emitTyping = (chatId, isTyping) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping });
    }
  };

  const emitSendMessage = (chatId, message) => {
    if (socket) {
      socket.emit('send_message', { chatId, message });
    }
  };

  const emitMessageSeen = (chatId, messageIds) => {
    if (socket) {
      socket.emit('message_seen', { chatId, messageIds });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, emitTyping, emitSendMessage, emitMessageSeen }}>
      {children}
    </SocketContext.Provider>
  );
};
