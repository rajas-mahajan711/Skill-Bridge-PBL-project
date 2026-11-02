"""
SkillBridge AI Service — Skill Gap Analysis Engine
===================================================
Analyzes candidate skill proficiencies against target role requirements,
prioritizes gaps, and suggests deterministic, practical learning actions.

Formulas & Criteria:
  Target Proficiency (T) : Default 80.0 (configurable between 50.0 and 100.0)
  Current Score (Sr)     : Verified proficiency score (0.0 if missing)
  Proficiency Gap (Gr)   : max(0.0, round(T - Sr, 1))

  Status:
    - "MISSING"           : if Sr == 0.0
    - "NEEDS_IMPROVEMENT" : if 0.0 < Sr < T

  Priority:
    - "HIGH"   : if Sr == 0.0 OR Gr >= 40.0
    - "MEDIUM" : if 20.0 <= Gr < 40.0
    - "LOW"    : if 0.0 < Gr < 20.0

  Learning Effort Planning Estimate:
    - 2 weeks per MISSING skill
    - 1 week per NEEDS_IMPROVEMENT skill deficit
    Assumption: Rough planning heuristic assuming 5–10 hours/week of dedicated practice.
    Not a guaranteed duration.

  Zero external commercial course URLs, zero fake certifications, zero hallucinated categories.
"""

from typing import Dict, List, Any, Tuple
from app.schemas.skill_schemas import (
    SkillGapItem,
    GapAnalysisResponse,
)
from app.core.taxonomy import SKILLS_TAXONOMY
from app.core.matcher import _resolve_canonical_skill


# ── Deterministic Action Templates ──────────────────────────────────────────

ACTION_TEMPLATES_MISSING: Dict[str, str] = {
    "programming_language": "Build core proficiency in {skill} by implementing foundational algorithms and a CLI application; commit evidence to GitHub.",
    "frontend": "Develop a responsive, accessible web interface using {skill} with state management and component testing.",
    "backend": "Design and implement a RESTful service using {skill} featuring structured validation, error handling, and API test coverage.",
    "database": "Model relational/document schemas using {skill}, implement indexed queries, transactions, and migration scripts.",
    "devops_tools": "Containerize or configure CI/CD pipelines with {skill}; document setup, build stages, and deployment scripts in a repository.",
    "ai_ml": "Implement an end-to-end data pipeline using {skill} with dataset preprocessing, evaluation metrics, and model artifact logging.",
    "cs_fundamentals": "Solve algorithmic problems focusing on {skill}; document time/space complexity analyses and edge cases on GitHub or LeetCode.",
}

ACTION_TEMPLATES_IMPROVEMENT: Dict[str, str] = {
    "programming_language": "Deepen advanced patterns in {skill} (concurrency, modular design, memory efficiency) through benchmarked code projects.",
    "frontend": "Optimize performance and component reusability in {skill}; add end-to-end tests and improve lighthouse score.",
    "backend": "Refactor backend service in {skill} to add caching, asynchronous workers, comprehensive integration tests, and security hardening.",
    "database": "Optimize slow query execution plans and index strategies in {skill}; implement connection pooling and stress-test data volume.",
    "devops_tools": "Automate multi-stage workflows and health monitoring in {skill} with production-grade rollback strategies.",
    "ai_ml": "Enhance model accuracy, perform cross-validation, and implement inference latency benchmarking using {skill}.",
    "cs_fundamentals": "Tackle medium-to-hard problems in {skill} under timed conditions; practice explaining tradeoffs and edge cases.",
}

GENERIC_MISSING_TEMPLATE = (
    "Build a foundational project applying {skill} from scratch; document architecture decisions and push verified code to GitHub."
)

GENERIC_IMPROVEMENT_TEMPLATE = (
    "Advance practical proficiency in {skill} by expanding project scope, adding comprehensive unit tests, and optimizing implementation."
)


def _get_learning_action(skill_name: str, status: str) -> str:
    """
    Select deterministic learning action template based on taxonomy category and status.
    For unknown taxonomy skills, preserves raw name and falls back to a practical generic project action.
    """
    category = None
    if skill_name in SKILLS_TAXONOMY:
        category = SKILLS_TAXONOMY[skill_name].get("category")
    else:
        # Check case-insensitive
        lower_name = skill_name.lower()
        for c_name, c_data in SKILLS_TAXONOMY.items():
            if c_name.lower() == lower_name:
                category = c_data.get("category")
                break

    if status == "MISSING":
        if category and category in ACTION_TEMPLATES_MISSING:
            return ACTION_TEMPLATES_MISSING[category].format(skill=skill_name)
        return GENERIC_MISSING_TEMPLATE.format(skill=skill_name)
    else:
        if category and category in ACTION_TEMPLATES_IMPROVEMENT:
            return ACTION_TEMPLATES_IMPROVEMENT[category].format(skill=skill_name)
        return GENERIC_IMPROVEMENT_TEMPLATE.format(skill=skill_name)


def analyze_gaps(
    student_skills: List[Dict[str, Any]],
    role_requirements: List[str],
    target_proficiency: float = 80.0,
) -> GapAnalysisResponse:
    """
    Analyze student skill gaps against target role requirements.
    Raises ValueError on invalid inputs (mapped to HTTP 422 in the API router).
    """
    # ── 1. Validate target proficiency ───────────────────────────────────────
    if not isinstance(target_proficiency, (int, float)):
        raise ValueError(f"target_proficiency must be a numeric value, got {type(target_proficiency).__name__}.")
    
    target_prof = float(target_proficiency)
    if target_prof < 50.0 or target_prof > 100.0:
        raise ValueError(
            f"target_proficiency must be between 50.0 and 100.0 (received {target_prof})."
        )

    # ── 2. Validate role requirements ─────────────────────────────────────────
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

    # ── 3. Validate and index student skills ───────────────────────────────────
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

        # Validate proficiency score / confidence
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

    # ── 4. Calculate gaps per role requirement ────────────────────────────────
    gaps: List[SkillGapItem] = []

    priority_weight = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}

    for req in canonical_requirements:
        req_key = req.lower()
        if req_key in student_skill_map:
            current_score = student_skill_map[req_key][1]
        else:
            current_score = 0.0

        gap_val = max(0.0, round(target_prof - current_score, 1))

        # If student meets or exceeds target threshold, no gap exists
        if gap_val == 0.0:
            continue

        if current_score == 0.0:
            status = "MISSING"
            priority = "HIGH"
        else:
            status = "NEEDS_IMPROVEMENT"
            if gap_val >= 40.0:
                priority = "HIGH"
            elif gap_val >= 20.0:
                priority = "MEDIUM"
            else:
                priority = "LOW"

        action = _get_learning_action(req, status)

        gaps.append(
            SkillGapItem(
                skill_name=req,
                priority=priority,
                status=status,
                current_score=current_score,
                target_score=target_prof,
                proficiency_gap=gap_val,
                learning_action=action,
            )
        )

    # ── 5. Sort gaps deterministically ────────────────────────────────────────
    # Order: Priority (HIGH > MEDIUM > LOW) -> proficiency_gap descending -> skill_name alphabetical
    gaps.sort(
        key=lambda g: (
            priority_weight.get(g.priority, 3),
            -g.proficiency_gap,
            g.skill_name.lower(),
        )
    )

    # ── 6. Metrics & Summary ──────────────────────────────────────────────────
    total_gaps = len(gaps)
    critical_gaps_count = sum(1 for g in gaps if g.priority == "HIGH")
    needs_improvement_count = sum(1 for g in gaps if g.status == "NEEDS_IMPROVEMENT")
    missing_count = sum(1 for g in gaps if g.status == "MISSING")

    # Planning heuristic: 2 wks per missing skill, 1 wk per improvement deficit
    estimated_effort_weeks = (2 * missing_count) + (1 * needs_improvement_count)

    if total_gaps == 0:
        summary = (
            f"No skill gaps identified. Candidate meets or exceeds the target proficiency "
            f"threshold of {target_prof} across all {len(canonical_requirements)} required skills."
        )
    else:
        summary = (
            f"Identified {total_gaps} skill gaps ({critical_gaps_count} high priority, "
            f"{needs_improvement_count} improvement areas) against the target threshold of {target_prof}. "
            f"Recommended rough planning effort: {estimated_effort_weeks} weeks."
        )

    return GapAnalysisResponse(
        gaps=gaps,
        total_gaps=total_gaps,
        critical_gaps_count=critical_gaps_count,
        target_proficiency=target_prof,
        estimated_effort_weeks=estimated_effort_weeks,
        summary=summary,
    )

