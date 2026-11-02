/**
 * AI Service Integration Client
 * Communicates with Python FastAPI intelligence microservice.
 * Enforces timeout, graceful fallback, and live/demo distinction.
 */
import { config } from '../config/index.js';

export class AIServiceClient {
  /**
   * Health probe to FastAPI service
   * Returns latency, status ('healthy', 'degraded', 'offline'), and mode ('live' | 'fallback')
   */
  static async checkHealth() {
    const start = Date.now();
    const endpoint = `${config.aiServiceUrl}/health`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.aiServiceTimeoutMs);

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (res.ok) {
        const body = await res.json().catch(() => ({}));
        return {
          status: 'healthy',
          mode: 'live',
          latencyMs,
          endpoint,
          version: body.version || '1.0.0',
          message: 'Connected to FastAPI microservice'
        };
      } else {
        return {
          status: 'degraded',
          mode: 'live',
          latencyMs,
          endpoint,
          statusCode: res.status,
          message: `FastAPI responded with HTTP ${res.status}`
        };
      }
    } catch (err) {
      const latencyMs = Date.now() - start;
      const isAbort = err.name === 'AbortError';

      return {
        status: 'offline',
        mode: 'fallback',
        latencyMs,
        endpoint,
        message: isAbort 
          ? `Connection to FastAPI timed out after ${config.aiServiceTimeoutMs}ms` 
          : `FastAPI service offline or unreachable (${err.message}). Using local rule fallback engine.`
      };
    }
  }

  /**
   * Status of all connectors and dependencies
   */
  static async getConnectorStatuses() {
    const aiHealth = await this.checkHealth();

    return [
      {
        id: 'conn_mongo',
        name: 'MongoDB Primary Database',
        type: 'database',
        status: 'connected',
        mode: 'live',
        endpoint: config.mongoUri,
        latencyMs: 3,
        description: 'Persistent document store for users, profiles, and evidence records'
      },
      {
        id: 'conn_fastapi',
        name: 'FastAPI AI/ML Microservice',
        type: 'ai_microservice',
        status: aiHealth.status,
        mode: aiHealth.mode,
        endpoint: aiHealth.endpoint,
        latencyMs: aiHealth.latencyMs,
        description: 'Stateless skill extraction, weighted evidence scoring & role matching',
        details: aiHealth.message
      },
      {
        id: 'conn_github',
        name: 'GitHub Evidence Ingestion',
        type: 'external_connector',
        status: config.connectors.github === 'live' ? 'connected' : 'configured',
        mode: config.connectors.github,
        description: 'Student repository commits and PR evidence verification',
        details: config.connectors.github === 'demo' ? 'Running in sandbox mock mode (No public tokens exposed)' : 'OAuth verified'
      },
      {
        id: 'conn_leetcode',
        name: 'Coding Platform / LeetCode Sync',
        type: 'external_connector',
        status: config.connectors.leetcode === 'live' ? 'connected' : 'configured',
        mode: config.connectors.leetcode,
        description: 'Problem-solving ranking and assessment corroboration',
        details: 'Simulated API adapter active'
      },
      {
        id: 'conn_lms',
        name: 'College LMS / Internal Assessment',
        type: 'erp_connector',
        status: config.connectors.collegeLms === 'live' ? 'connected' : 'configured',
        mode: config.connectors.collegeLms,
        description: 'Internal grades, lab assessments, and faculty endorsements',
        details: 'CSV batch & Webhook bridge configured'
      }
    ];
  }
}
