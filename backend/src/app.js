const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const evidenceRoutes = require('./routes/evidenceRoutes');
const skillAnalysisRoutes = require('./routes/skillAnalysisRoutes');
const learningRoutes = require('./routes/learningRoutes');
const errorHandler = require('./middleware/errorHandler');
const AIServiceClient = require('./services/aiServiceClient');

const app = express();

// Security headers
app.use(helmet());

// Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for local development / testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging in development
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting for API endpoints (200 requests per 15 minutes per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// System Health Endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  const aiHealth = await AIServiceClient.checkHealth();

  res.status(200).json({
    status: 'healthy',
    service: 'SkillBridge Express Backend (Student Module)',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'unconnected',
    },
    aiService: aiHealth,
  });
});

// Mount modular REST API endpoints
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api', skillAnalysisRoutes);
app.use('/api/learning', learningRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
