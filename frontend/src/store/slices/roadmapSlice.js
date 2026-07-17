import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const loadPaths = createAsyncThunk('roadmap/loadPaths', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/paths');
    return res.data.paths;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load paths');
  }
});

export const loadPathById = createAsyncThunk('roadmap/loadPathById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/paths/${id}`);
    return res.data.path;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load path');
  }
});

export const generatePathAI = createAsyncThunk('roadmap/generatePath', async (params, { rejectWithValue }) => {
  try {
    const res = await api.post('/paths/generate', params);
    return res.data.path;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to generate path');
  }
});

export const toggleNode = createAsyncThunk('roadmap/toggleNode', async ({ pathId, nodeId, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/paths/${pathId}/node/${nodeId}`, { status });
    return res.data; // returns { path, certificate }
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update node');
  }
});

export const loadGoals = createAsyncThunk('roadmap/loadGoals', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/paths/goals');
    return res.data.goals;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load goals');
  }
});

export const addGoal = createAsyncThunk('roadmap/addGoal', async (goalData, { rejectWithValue }) => {
  try {
    const res = await api.post('/paths/goal', goalData);
    return res.data.goal;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add career goal');
  }
});

const initialState = {
  paths: [],
  currentPath: null,
  goals: [],
  isLoading: false,
  isGenerating: false,
  error: null,
  newCertificate: null,
};

const roadmapSlice = createSlice({
  name: 'roadmap',
  initialState,
  reducers: {
    clearNewCertificate: (state) => {
      state.newCertificate = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // loadPaths
      .addCase(loadPaths.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadPaths.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paths = action.payload;
      })
      .addCase(loadPaths.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // loadPathById
      .addCase(loadPathById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadPathById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPath = action.payload;
      })
      .addCase(loadPathById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // generatePathAI
      .addCase(generatePathAI.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generatePathAI.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.paths.unshift(action.payload);
        state.currentPath = action.payload;
      })
      .addCase(generatePathAI.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload;
      })
      // toggleNode
      .addCase(toggleNode.fulfilled, (state, action) => {
        state.currentPath = action.payload.path;
        if (action.payload.certificate) {
          state.newCertificate = action.payload.certificate;
        }
        // Update paths list
        const idx = state.paths.findIndex(p => p._id === action.payload.path._id);
        if (idx !== -1) {
          state.paths[idx] = action.payload.path;
        }
      })
      // loadGoals
      .addCase(loadGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
      })
      // addGoal
      .addCase(addGoal.fulfilled, (state, action) => {
        state.goals.unshift(action.payload);
      });
  },
});

export const { clearNewCertificate } = roadmapSlice.actions;
export default roadmapSlice.reducer;
