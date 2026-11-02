/**
 * AI Endpoint Request Validators
 * Validates required fields and types before forwarding to the FastAPI microservice.
 * Rejects malformed requests with HTTP 400 (VALIDATION_ERROR) without touching the AI service.
 *
 * Security rules enforced here:
 *   - No demographic or sensitive attributes (gender, race, age, religion, address) accepted.
 *   - text field size is capped to prevent memory exhaustion.
 */

const SENSITIVE_FIELDS = ['gender', 'race', 'ethnicity', 'religion', 'age', 'address', 'nationality'];
const MAX_TEXT_CHARS = 100_000; // ~100 KB — guard against oversized payloads

/**
 * Return a 400 VALIDATION_ERROR response helper.
 */
function validationError(res, message, details = null) {
  return res.status(400).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message,
      details,
    },
  });
}

/**
 * Check that no sensitive demographic attributes are present in the request body.
 */
function hasSensitiveAttributes(body) {
  const flat = JSON.stringify(body).toLowerCase();
  return SENSITIVE_FIELDS.some((field) => flat.includes(`"${field}"`));
}

// ── Validate POST /api/v1/ai/skills/extract ────────────────────────────────

export const validateExtractSkills = (req, res, next) => {
  const { text, source } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return validationError(res, "'text' is required and must be a non-empty string.");
  }

  if (text.length > MAX_TEXT_CHARS) {
    return validationError(
      res,
      `'text' exceeds maximum allowed length of ${MAX_TEXT_CHARS} characters.`,
    );
  }

  const allowedSources = ['resume', 'github', 'leetcode', 'project', 'text', 'assessment', 'certificate'];
  if (source !== undefined && !allowedSources.includes(source)) {
    return validationError(
      res,
      `Invalid 'source' value '${source}'. Must be one of: [${allowedSources.join(', ')}].`,
    );
  }

  next();
};

// ── Validate POST /api/v1/ai/skills/score ─────────────────────────────────

export const validateScoreSkills = (req, res, next) => {
  const { evidence_items, source_weights } = req.body || {};

  if (!Array.isArray(evidence_items)) {
    return validationError(res, "'evidence_items' is required and must be an array.");
  }

  if (evidence_items.length === 0) {
    return validationError(res, "'evidence_items' must contain at least one item.");
  }

  for (let i = 0; i < evidence_items.length; i++) {
    const item = evidence_items[i];
    if (!item || typeof item !== 'object') {
      return validationError(res, `evidence_items[${i}] must be an object.`);
    }
    if (!item.skill_name || typeof item.skill_name !== 'string' || !item.skill_name.trim()) {
      return validationError(res, `evidence_items[${i}].skill_name is required and must be a non-empty string.`);
    }
  }

  if (source_weights !== undefined && source_weights !== null) {
    if (typeof source_weights !== 'object' || Array.isArray(source_weights)) {
      return validationError(res, "'source_weights' must be an object mapping source names to numeric weights.");
    }
    for (const [key, val] of Object.entries(source_weights)) {
      if (typeof val !== 'number') {
        return validationError(res, `source_weights['${key}'] must be a number.`);
      }
    }
  }

  next();
};

// ── Validate POST /api/v1/ai/matches/rank ─────────────────────────────────

export const validateRankRoleMatch = (req, res, next) => {
  const { student_skills, role_requirements } = req.body || {};

  if (!Array.isArray(student_skills)) {
    return validationError(res, "'student_skills' is required and must be an array.");
  }

  if (!Array.isArray(role_requirements) || role_requirements.length === 0) {
    return validationError(res, "'role_requirements' is required and must be a non-empty array.");
  }

  for (let i = 0; i < role_requirements.length; i++) {
    if (typeof role_requirements[i] !== 'string' || !role_requirements[i].trim()) {
      return validationError(res, `role_requirements[${i}] must be a non-empty string.`);
    }
  }

  for (let i = 0; i < student_skills.length; i++) {
    const skill = student_skills[i];
    if (!skill || typeof skill !== 'object') {
      return validationError(res, `student_skills[${i}] must be an object.`);
    }
    const name = skill.skill_name || skill.name;
    if (!name || typeof name !== 'string' || !String(name).trim()) {
      return validationError(res, `student_skills[${i}] must have a non-empty 'skill_name' or 'name'.`);
    }
  }

  // Reject sensitive demographic attributes per INTEGRATION_CONTRACT §5.2
  if (hasSensitiveAttributes(req.body)) {
    return validationError(
      res,
      'Sensitive demographic attributes (gender, race, age, religion, etc.) must not be submitted for skill matching.',
    );
  }

  next();
};

// ── Validate POST /api/v1/ai/gaps/analyze ─────────────────────────────────

export const validateAnalyzeGaps = (req, res, next) => {
  const { student_skills, role_requirements, target_proficiency } = req.body || {};

  if (!Array.isArray(student_skills)) {
    return validationError(res, "'student_skills' is required and must be an array.");
  }

  if (!Array.isArray(role_requirements) || role_requirements.length === 0) {
    return validationError(res, "'role_requirements' is required and must be a non-empty array.");
  }

  for (let i = 0; i < role_requirements.length; i++) {
    if (typeof role_requirements[i] !== 'string' || !role_requirements[i].trim()) {
      return validationError(res, `role_requirements[${i}] must be a non-empty string.`);
    }
  }

  if (target_proficiency !== undefined) {
    const tp = Number(target_proficiency);
    if (!Number.isFinite(tp) || tp < 50 || tp > 100) {
      return validationError(res, "'target_proficiency' must be a number between 50 and 100.");
    }
  }

  // Reject sensitive demographic attributes per INTEGRATION_CONTRACT §5.2
  if (hasSensitiveAttributes(req.body)) {
    return validationError(
      res,
      'Sensitive demographic attributes (gender, race, age, religion, etc.) must not be submitted for gap analysis.',
    );
  }

  next();
};

