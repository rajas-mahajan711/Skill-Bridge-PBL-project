"""
SkillBridge AI Service — Role Matching Engine
==============================================
Calculates deterministic, explainable role-fit matching scores
comparing student skill profiles against job-role requirements.

Formula:
  Coverage Ratio     = count(matched_skills) / count(role_requirements)
  Weighted Prof      = sum(matched_scores) / (count(role_requirements) * 100.0)
  Match Score        = min(100.0, round(100.0 * (0.40 * Coverage + 0.60 * Weighted Prof), 1))

Rules:
- 40% coverage weight + 60% proficiency weight.
- Missing skills contribute 0.0 to proficiency; divisor is always total requirements N.
- Strict input validation: scores must be between 0 and 100; confidence between 0.0 and 1.0.
- If both score and confidence are absent, raises ValueError (HTTP 422).
- Zero sensitive attributes accepted or evaluated.
"""

from typing import Dict, List, Any, Tuple
from app.schemas.skill_schemas import RoleMatchResponse
from app.core.taxonomy import SKILLS_TAXONOMY


def _resolve_canonical_skill(name: str) -> str:
    """Resolve skill string to canonical taxonomy name using only defined aliases."""
    trimmed = name.strip()
    lower = trimmed.lower()

    for canonical, data in SKILLS_TAXONOMY.items():
        if canonical.lower() == lower:
            return canonical
        for alias in data.get("aliases", []):
            if alias.lower() == lower:
                return canonical
    return trimmed


def _determine_level(score: float) -> str:
    if score >= 80.0:
        return "Advanced"
    elif score >= 60.0:
        return "Intermediate"
    else:
        return "Beginner"


def match_role(
    student_skills: List[Dict[str, Any]],
    role_requirements: List[str],
) -> RoleMatchResponse:
    """
    Match student skills against role requirements and return a deterministic RoleMatchResponse.
    """
    # ── 1. Validate role requirements ─────────────────────────────────────────
    if not role_requirements:
        raise ValueError("role_requirements cannot be empty. At least one required skill is needed.")

    canonical_requirements: List[str] = []
    seen_reqs = set()
    for raw_req in role_requirements:
        if not isinstance(raw_req, str) or not raw_req.strip():
            continue
        canonical = _resolve_canonical_skill(raw_req)
        if canonical.lower() not in seen_reqs:
            seen_reqs.add(canonical.lower())
            canonical_requirements.append(canonical)

    if not canonical_requirements:
        raise ValueError("role_requirements must contain at least one valid, non-empty skill requirement.")

    total_req_count = len(canonical_requirements)

    # ── 2. Validate and index student skills ───────────────────────────────────
    student_skill_map: Dict[str, Tuple[str, float]] = {}  # {canonical_lower: (canonical_name, score)}

    for idx, item in enumerate(student_skills or []):
        if not isinstance(item, dict):
            raise ValueError(f"Student skill entry at index {idx} must be a dictionary.")

        raw_name = item.get("skill_name") or item.get("name")
        if not raw_name or not str(raw_name).strip():
            raise ValueError(f"Student skill at index {idx} must provide a non-empty 'skill_name' or 'name'.")

        name_str = str(raw_name).strip()
        canonical_name = _resolve_canonical_skill(name_str)
        key = canonical_name.lower()

        # Validate proficiency input
        if "score" in item and item["score"] is not None:
            score_val = item["score"]
            if not isinstance(score_val, (int, float)):
                raise ValueError(f"Skill score for '{name_str}' must be a number, got {type(score_val).__name__}.")
            if score_val < 0.0 or score_val > 100.0:
                raise ValueError(f"Skill score for '{name_str}' must be between 0.0 and 100.0, got {score_val}.")
            prof = float(score_val)
        elif "confidence" in item and item["confidence"] is not None:
            conf_val = item["confidence"]
            if not isinstance(conf_val, (int, float)):
                raise ValueError(f"Skill confidence for '{name_str}' must be a number, got {type(conf_val).__name__}.")
            if conf_val < 0.0 or conf_val > 1.0:
                raise ValueError(f"Skill confidence for '{name_str}' must be between 0.0 and 1.0, got {conf_val}.")
            prof = round(float(conf_val) * 100.0, 1)
        else:
            raise ValueError(
                f"Student skill '{name_str}' at index {idx} must provide either a 'score' (0-100) or 'confidence' (0-1.0)."
            )

        # Handle duplicates: retain highest verified score
        if key in student_skill_map:
            prev_name, prev_score = student_skill_map[key]
            if prof > prev_score:
                student_skill_map[key] = (canonical_name, prof)
        else:
            student_skill_map[key] = (canonical_name, prof)

    # ── 3. Evaluate matching ──────────────────────────────────────────────────
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    matched_scores: Dict[str, float] = {}

    for req in canonical_requirements:
        req_key = req.lower()
        if req_key in student_skill_map:
            matched_skills.append(req)
            matched_scores[req] = student_skill_map[req_key][1]
        else:
            missing_skills.append(req)

    matched_skills.sort()
    missing_skills.sort()

    # ── 4. Calculate Match Score ──────────────────────────────────────────────
    matched_count = len(matched_skills)
    coverage_ratio = matched_count / total_req_count

    # Sum of proficiencies divided by total requirements count (missing skills contribute 0)
    matched_prof_sum = sum(matched_scores.values())
    weighted_proficiency = matched_prof_sum / (total_req_count * 100.0)

    raw_score = 100.0 * (0.40 * coverage_ratio + 0.60 * weighted_proficiency)
    match_score = min(100.0, round(raw_score, 1))

    # ── 5. Generate human-readable explanation array ──────────────────────────
    explanation: List[str] = []
    coverage_pct = round(coverage_ratio * 100.0, 1)
    explanation.append(
        f"Candidate possesses {matched_count} of {total_req_count} required skills ({coverage_pct}% requirement coverage)."
    )

    for skill in matched_skills:
        sc = matched_scores[skill]
        lvl = _determine_level(sc)
        # Point contribution to match_score
        pts = round(100.0 * ((0.40 / total_req_count) + (0.60 * (sc / (total_req_count * 100.0)))), 1)
        explanation.append(
            f"Matched requirement '{skill}': score {sc:.1f} ({lvl}) contributes {pts:.1f}% to role fit."
        )

    for skill in missing_skills:
        explanation.append(
            f"Missing critical requirement '{skill}': 0.0 points credited."
        )

    explanation.append(f"Overall role match score evaluated at {match_score:.1f}%.")

    return RoleMatchResponse(
        match_score=match_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        explanation=explanation,
    )

