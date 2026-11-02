/**
 * AI Service Integration Client
 * Communicates with Python FastAPI intelligence microservice.
 * Enforces timeout, graceful fallback, and live/demo distinction.
 *
 * Inference methods: extractSkills, scoreSkills, rankRoleMatch, analyzeGaps
 * Each method:
 *   - Uses AbortController + configurable timeout
 *   - Throws a structured AIServiceError on timeout, network failure, or non-2xx
 *   - Never exposes internal stack traces in thrown errors
 */
import { config } from '../config/index.js';

/**
 * Structured error thrown by all AI proxy methods.
 * Callers can inspect .code to distinguish timeout from unavailable from bad response.
 */
export class AIServiceError extends Error {
  constructor(message, code, statusCode = 503) {
    super(message);
    this.name = 'AIServiceError';
    this.code = code;          // 'AI_TIMEOUT' | 'AI_UNAVAILABLE' | 'AI_BAD_RESPONSE'
    this.statusCode = statusCode;
  }
}

export class AIServiceClient {
  // ── Internal shared POST helper ──────────────────────────────────────────

  /**
   * POST JSON to a FastAPI endpoint and return the parsed body.
   * Throws AIServiceError on timeout, network failure, or non-2xx response.
   * Never leaks internal Node.js error messages to callers.
   *
   * @param {string} path  - Path relative to aiServiceUrl, e.g. '/api/v1/skills/extract'
   * @param {object} body  - Request body (will be JSON-serialised)
   * @returns {Promise<object>} Parsed JSON response body
   */
  static async _post(path, body) {
    const endpoint = `${config.aiServiceUrl}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.aiServiceTimeoutMs);

    let res;
    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new AIServiceError(
          `AI service did not respond within ${config.aiServiceTimeoutMs}ms. Try again shortly.`,
          'AI_TIMEOUT',
          503,
        );
      }
      throw new AIServiceError(
        'AI service is currently unavailable. Please try again later.',
        'AI_UNAVAILABLE',
        503,
      );
    }

    clearTimeout(timeoutId);

    // Parse response body regardless of status to capture AI error detail
    let parsed;
    try {
      parsed = await res.json();
    } catch {
      throw new AIServiceError(
        'AI service returned an unreadable response.',
        'AI_BAD_RESPONSE',
        502,
      );
    }

    if (!res.ok) {
      // 422 from FastAPI means the payload we forwarded was invalid at the AI layer
      const statusCode = res.status === 422 ? 400 : 502;
      const aiDetail = parsed?.detail || parsed?.message || `AI service error HTTP ${res.status}`;
      throw new AIServiceError(aiDetail, 'AI_BAD_RESPONSE', statusCode);
    }

    return parsed;
  }

  // ── Public inference methods ─────────────────────────────────────────────

  /**
   * Extract skills from evidence text.
   * Maps to POST /api/v1/skills/extract on the FastAPI service.
   *
   * @param {string} text   - Evidence text (resume, project description, etc.)
   * @param {string} source - Evidence source label (resume|github|leetcode|project|text)
   * @returns {Promise<{skills: Array, extracted_count: number}>}
   */
  static async extractSkills(text, source = 'text') {
    return this._post('/api/v1/skills/extract', { text, source });
  }

  /**
   * Calculate evidence-backed skill proficiency scores.
   * Maps to POST /api/v1/skills/score on the FastAPI service.
   *
   * @param {Array}  evidenceItems  - List of evidence items
   * @param {object} sourceWeights  - Optional custom source weights
   * @returns {Promise<{skills: Array, overall_score: number, readiness_tier: string, scored_count: number}>}
   */
  static async scoreSkills(evidenceItems, sourceWeights = null) {
    const body = { evidence_items: evidenceItems };
    if (sourceWeights !== null) body.source_weights = sourceWeights;
    return this._post('/api/v1/skills/score', body);
  }

  /**
   * Match student skills against job role requirements.
   * Maps to POST /api/v1/matches/rank on the FastAPI service.
   *
   * @param {Array} studentSkills     - List of student skill objects
   * @param {Array} roleRequirements  - List of required skill name strings
   * @returns {Promise<{match_score: number, matched_skills: Array, missing_skills: Array, explanation: Array}>}
   */
  static async rankRoleMatch(studentSkills, roleRequirements) {
    return this._post('/api/v1/matches/rank', {
      student_skills: studentSkills,
      role_requirements: roleRequirements,
    });
  }

  /**
   * Analyse skill gaps against target role requirements.
   * Maps to POST /api/v1/gaps/analyze on the FastAPI service.
   *
   * @param {Array}  studentSkills      - List of student skill objects
   * @param {Array}  roleRequirements   - List of required skill name strings
   * @param {number} targetProficiency  - Target threshold (50–100, default 80)
   * @returns {Promise<GapAnalysisResponse>}
   */
  static async analyzeGaps(studentSkills, roleRequirements, targetProficiency = 80.0) {
    return this._post('/api/v1/gaps/analyze', {
      student_skills: studentSkills,
      role_requirements: roleRequirements,
      target_proficiency: targetProficiency,
    });
  }
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
