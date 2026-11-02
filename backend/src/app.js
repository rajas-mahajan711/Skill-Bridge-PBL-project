/**
 * SkillBridge Application Gateway (Express & Node.js HTTP compatible)
 * Dispatches requests, enforces CORS, parses JSON, and routes through middleware chains.
 */
import { config } from './config/index.js';
import { setupAdminRoutes } from './routes/adminRoutes.js';
import { setupAIRoutes } from './routes/aiRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

class Router {
  constructor() {
    this.routes = [];
  }

  get(path, ...handlers) {
    this.addRoute('GET', path, handlers);
  }

  post(path, ...handlers) {
    this.addRoute('POST', path, handlers);
  }

  patch(path, ...handlers) {
    this.addRoute('PATCH', path, handlers);
  }

  delete(path, ...handlers) {
    this.addRoute('DELETE', path, handlers);
  }

  addRoute(method, path, handlers) {
    // Convert path with params like /admin/users/:id to regex
    const paramNames = [];
    const regexPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });

    this.routes.push({
      method: method.toUpperCase(),
      path,
      regex: new RegExp(`^${regexPath}$`),
      paramNames,
      handlers
    });
  }

  match(method, pathname) {
    for (const route of this.routes) {
      if (route.method !== method.toUpperCase()) continue;
      const match = pathname.match(route.regex);
      if (match) {
        const params = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { handlers: route.handlers, params, route };
      }
    }
    return null;
  }
}

export class App {
  constructor() {
    this.router = new Router();
    this.initRoutes();
  }

  initRoutes() {
    const prefix = config.apiPrefix; // e.g. /api/v1

    // Health check endpoint (Person 5 / Infrastructure)
    this.router.get(`${prefix}/health`, (req, res) => {
      res.status(200).json({
        success: true,
        data: {
          status: 'UP',
          uptime: process.uptime ? process.uptime() : 0,
          timestamp: new Date().toISOString(),
          environment: config.env,
          version: '1.0.0'
        }
      });
    });

    // Sub-router prefix wrapper for admin routes
    const prefixedRouter = {
      get: (path, ...handlers) => this.router.get(`${prefix}${path}`, ...handlers),
      post: (path, ...handlers) => this.router.post(`${prefix}${path}`, ...handlers),
      patch: (path, ...handlers) => this.router.patch(`${prefix}${path}`, ...handlers),
      delete: (path, ...handlers) => this.router.delete(`${prefix}${path}`, ...handlers)
    };

    // Attach Admin Routes (Person 5 scope)
    setupAdminRoutes(prefixedRouter);

    // Attach AI Proxy Routes (Person 3 integration)
    setupAIRoutes(prefixedRouter);
  }

  async handleRequest(req, res) {
    // 1. CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Enhance res with status and json helpers
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data));
      return res;
    };

    try {
      // Parse URL and Query
      const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      req.path = urlObj.pathname;
      req.query = Object.fromEntries(urlObj.searchParams.entries());

      // Parse JSON Body for POST/PATCH/PUT
      if (['POST', 'PATCH', 'PUT'].includes(req.method.toUpperCase())) {
        const bodyText = await new Promise((resolve) => {
          let chunks = '';
          req.on('data', chunk => chunks += chunk);
          req.on('end', () => resolve(chunks));
        });

        if (bodyText) {
          try {
            req.body = JSON.parse(bodyText);
          } catch {
            return res.status(400).json({
              success: false,
              error: {
                code: 'INVALID_JSON',
                message: 'Malformed JSON payload in request body',
                details: null
              }
            });
          }
        } else {
          req.body = {};
        }
      } else {
        req.body = {};
      }

      // Route lookup
      const matched = this.router.match(req.method, req.path);
      if (!matched) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Endpoint ${req.method} ${req.path} not found`,
            details: null
          }
        });
      }

      req.params = matched.params;

      // Sequential middleware execution
      const handlers = [...matched.handlers];
      const executeNext = async () => {
        if (handlers.length === 0) return;
        const currentHandler = handlers.shift();
        await currentHandler(req, res, (err) => {
          if (err) {
            return errorHandler(err, req, res);
          }
          return executeNext();
        });
      };

      await executeNext();
    } catch (fatalErr) {
      errorHandler(fatalErr, req, res);
    }
  }
}

export const createApp = () => new App();
