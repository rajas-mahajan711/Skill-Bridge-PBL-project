/**
 * SkillBridge Centralized Backend Configuration
 * Reads from process.env with resilient defaults for integration and testing
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  
  // Database configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge',
  mongoDebug: process.env.MONGODB_DEBUG === 'true',
  
  // Auth configuration
  jwtSecret: process.env.JWT_SECRET || 'skillbridge-default-dev-secret-do-not-use-in-prod-12345',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Microservice integrations
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  aiServiceTimeoutMs: parseInt(process.env.AI_SERVICE_TIMEOUT_MS || '8000', 10),
  
  // Connector Modes: 'live' or 'demo'
  connectors: {
    github: process.env.GITHUB_CONNECTOR_MODE || 'demo',
    leetcode: process.env.LEETCODE_CONNECTOR_MODE || 'demo',
    collegeLms: process.env.COLLEGE_LMS_CONNECTOR_MODE || 'demo'
  }
};
