import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const loadChats = createAsyncThunk('chat/loadChats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chat/chats');
    return res.data.chats;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load chats');
  }
});

export const loadMessages = createAsyncThunk('chat/loadMessages', async (chatId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/chat/chats/${chatId}/messages`);
    return { chatId, messages: res.data.messages };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load messages');
  }
});

export const postMessage = createAsyncThunk('chat/postMessage', async ({ chatId, text, fileUrl, fileType }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/chat/chats/${chatId}/messages`, { text, fileUrl, fileType });
    return res.data.message;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send message');
  }
});

export const initiateChat = createAsyncThunk('chat/initiateChat', async (recipientId, { rejectWithValue }) => {
  try {
    const res = await api.post('/chat/chats', { recipientId });
    return res.data.chat;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to open chat thread');
  }
});

const initialState = {
  chats: [],
  activeChat: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {}, // chatId -> { userId: boolean }
  isLoading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      state.messages = [];
    },
    receiveMessage: (state, action) => {
      // If message is from current active chat, append it
      if (state.activeChat && state.activeChat._id === action.payload.chatId) {
        state.messages.push(action.payload.message);
      }
      // Update last message in chat list
      const chatIdx = state.chats.findIndex(c => c._id === action.payload.chatId);
      if (chatIdx !== -1) {
        state.chats[chatIdx].lastMessage = action.payload.message;
        // Move chat to top of list
        const updatedChat = state.chats.splice(chatIdx, 1)[0];
        state.chats.unshift(updatedChat);
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    userJoinedOnline: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    userLeftOffline: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    setTypingState: (state, action) => {
      const { chatId, userId, isTyping } = action.payload;
      if (!state.typingUsers[chatId]) {
        state.typingUsers[chatId] = {};
      }
      state.typingUsers[chatId][userId] = isTyping;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadChats
      .addCase(loadChats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(loadChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // loadMessages
      .addCase(loadMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      // postMessage
      .addCase(postMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
        // Update last message in chat list
        const chatIdx = state.chats.findIndex(c => c._id === action.payload.chat);
        if (chatIdx !== -1) {
          state.chats[chatIdx].lastMessage = action.payload;
        }
      })
      // initiateChat
      .addCase(initiateChat.fulfilled, (state, action) => {
        const chatExist = state.chats.find(c => c._id === action.payload._id);
        if (!chatExist) {
          state.chats.unshift(action.payload);
        }
        state.activeChat = action.payload;
      });
  },
});

export const {
  setActiveChat,
  receiveMessage,
  setOnlineUsers,
  userJoinedOnline,
  userLeftOffline,
  setTypingState,
} = chatSlice.actions;
export default chatSlice.reducer;
