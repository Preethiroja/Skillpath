import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', userData);
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loadProfile = createAsyncThunk('auth/loadProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/profile');
    return res.data.profile;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
  }
});

export const saveProfile = createAsyncThunk('auth/saveProfile', async (profileData, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', profileData);
    return res.data.profile;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Logout error on server', err);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
  return null;
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  profile: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load Profile
      .addCase(loadProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Save Profile
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
