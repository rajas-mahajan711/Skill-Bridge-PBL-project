/**
 * SkillBridge Backend Server Entry Point
 */
import http from 'node:http';
import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();
const server = http.createServer((req, res) => app.handleRequest(req, res));

if (process.env.NODE_ENV !== 'test') {
  server.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`  SkillBridge API Gateway running on port ${config.port}`);
    console.log(`  Environment: ${config.env}`);
    console.log(`  API Prefix:  ${config.apiPrefix}`);
    console.log(`  Health Check: http://localhost:${config.port}${config.apiPrefix}/health`);
    console.log(`  Admin Routes: http://localhost:${config.port}${config.apiPrefix}/admin/*`);
    console.log(`=======================================================`);
  });
}

export { server, app };
