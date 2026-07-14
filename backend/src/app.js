require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { initSocket } = require('./services/socketService');
const errorHandler = require('./middleware/error');
const { seedDefaultBadges } = require('./utils/seedBadges');

// Import routes
const authRoutes = require('./routes/authRoutes');
const pathRoutes = require('./routes/pathRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB().then(() => seedDefaultBadges());

// Initialize Socket.io
initSocket(server);

// Standard Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/paths', pathRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes); // contains chat & notifications
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes); // badges, leaderboard, timer, notes, wishlist
app.use('/api/assessment', assessmentRoutes); // AI career assessment

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SkillPath AI - Personalized Learning Path API Service',
    version: '1.0.0',
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = { app, server };
