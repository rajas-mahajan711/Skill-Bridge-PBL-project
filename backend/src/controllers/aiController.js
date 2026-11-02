/**
 * AI Controller
 * Forwards validated requests to the FastAPI AI microservice via AIServiceClient.
 * Handles AI-layer errors (timeout, unavailable, bad response) and maps them to safe HTTP responses.
 *
 * Security:
 *   - All inputs are pre-validated by aiValidator.js before reaching this controller.
 *   - Raw internal error messages are never forwarded to the client.
 *   - AIServiceError.code is used to select the appropriate HTTP status; the safe
 *     message from AIServiceError is forwarded as-is (it contains no stack traces).
 */
import { AIServiceClient, AIServiceError } from '../services/aiServiceClient.js';

/**
 * Convert an AIServiceError into a consistent JSON error response.
 * Maps AI error codes to appropriate HTTP status codes.
 */
function handleAIError(err, res) {
  if (err instanceof AIServiceError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: null,
      },
    });
  }
  // Unexpected non-AI error — do not expose internals
  console.error('[AIController] Unexpected error:', err.message);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      details: null,
    },
  });
}

export class AIController {
  /**
   * POST /api/v1/ai/skills/extract
   * Forwards { text, source } to FastAPI and returns extracted skills.
   */
  static async extractSkills(req, res, next) {
    try {
      const { text, source = 'text' } = req.body;
      const result = await AIServiceClient.extractSkills(text, source);
      return res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return handleAIError(err, res);
    }
  }

  /**
   * POST /api/v1/ai/skills/score
   * Forwards evidence_items (and optional source_weights) to FastAPI and returns scored skills.
   */
  static async scoreSkills(req, res, next) {
    try {
      const { evidence_items, source_weights = null } = req.body;
      const result = await AIServiceClient.scoreSkills(evidence_items, source_weights);
      return res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return handleAIError(err, res);
    }
  }

  /**
   * POST /api/v1/ai/matches/rank
   * Forwards student_skills and role_requirements to FastAPI and returns match result.
   */
  static async rankRoleMatch(req, res, next) {
    try {
      const { student_skills, role_requirements } = req.body;
      const result = await AIServiceClient.rankRoleMatch(student_skills, role_requirements);
      return res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return handleAIError(err, res);
    }
  }

  /**
   * POST /api/v1/ai/gaps/analyze
   * Forwards student_skills, role_requirements, and target_proficiency to FastAPI.
   */
  static async analyzeGaps(req, res, next) {
    try {
      const { student_skills, role_requirements, target_proficiency = 80.0 } = req.body;
      const result = await AIServiceClient.analyzeGaps(
        student_skills,
        role_requirements,
        target_proficiency,
      );
      return res.status(200).json({
        success: true,
        data: result,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (err) {
      return handleAIError(err, res);
    }
  }
}

