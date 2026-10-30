require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Start database connection, then start server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SkillBridge Express Backend running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 REST API Root: http://localhost:${PORT}/api`);
    console.log(`💓 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.name}: ${err.message}`);
    // Keep server running in development mode
  });
});
