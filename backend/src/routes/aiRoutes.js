/**
 * AI Intelligence Routes
 * Exposes backend proxy endpoints for the four FastAPI AI capabilities.
 *
 * All routes require a valid Bearer token (any authenticated role).
 * Validation is applied before the controller receives the request.
 *
 * Prefix: /api/v1/ai/
 *   POST /api/v1/ai/skills/extract    → Skill extraction from text
 *   POST /api/v1/ai/skills/score      → Evidence-backed skill scoring
 *   POST /api/v1/ai/matches/rank      → Job role matching
 *   POST /api/v1/ai/gaps/analyze      → Skill gap analysis
 *
 * Route prefix /api/v1/ai/* is chosen to:
 *   - Not conflict with existing /api/v1/admin/* routes.
 *   - Not conflict with future /api/v1/student/* or /api/v1/faculty/* routes.
 *   - Make it clear these are AI-forwarding proxy endpoints.
 */
import { AIController } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
  validateExtractSkills,
  validateScoreSkills,
  validateRankRoleMatch,
  validateAnalyzeGaps,
} from '../validators/aiValidator.js';

export function setupAIRoutes(router) {
  // All AI routes require a valid auth token (any role).
  // Role restriction is left to individual future consumer routes (student, recruiter, faculty).
  router.post('/ai/skills/extract', authMiddleware, validateExtractSkills, AIController.extractSkills);
  router.post('/ai/skills/score',   authMiddleware, validateScoreSkills,   AIController.scoreSkills);
  router.post('/ai/matches/rank',   authMiddleware, validateRankRoleMatch, AIController.rankRoleMatch);
  router.post('/ai/gaps/analyze',   authMiddleware, validateAnalyzeGaps,   AIController.analyzeGaps);
}

