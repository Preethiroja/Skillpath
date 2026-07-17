import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const loadNotifications = createAsyncThunk('notification/loadNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chat/notifications'); // returns { notifications, unreadCount }
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load notifications');
  }
});

export const markNotificationRead = createAsyncThunk('notification/markRead', async (id, { rejectWithValue }) => {
  try {
    const res = await api.put(`/chat/notifications/${id}/read`);
    return res.data.notification;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to mark notification as read');
  }
});

export const removeNotification = createAsyncThunk('notification/remove', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/chat/notifications/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete notification');
  }
});

const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearAll: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadNotifications
      .addCase(loadNotifications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(loadNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // markNotificationRead
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.notifications.findIndex(n => n._id === action.payload._id);
        if (idx !== -1) {
          state.notifications[idx] = action.payload;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      // removeNotification
      .addCase(removeNotification.fulfilled, (state, action) => {
        const notif = state.notifications.find(n => n._id === action.payload);
        if (notif && !notif.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== action.payload);
      });
  },
});

export const { addNotification, clearAll } = notificationSlice.actions;
export default notificationSlice.reducer;
