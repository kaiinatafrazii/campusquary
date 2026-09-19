const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const questionRoutes = require('./routes/questionRoutes');
const answerRoutes = require('./routes/answerRoutes');
const tagRoutes = require('./routes/tagRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { Question } = require('./models/Question');
const seed = require('./seeds/seedData');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/admin', adminRoutes);

// Health check & stats ping
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'CampusQuery – College Knowledge Base Platform',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err);
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is freshly initialized or empty
  try {
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      console.log('⚡ Empty database detected. Auto-seeding initial college questions & accounts...');
      await seed();
    }
  } catch (e) {
    console.error('Seed verification error:', e.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 CampusQuery Server running on http://localhost:${PORT}`);
  });
};

startServer();
