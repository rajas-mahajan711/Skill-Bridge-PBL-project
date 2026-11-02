"""
SkillBridge AI Service — Skill Scoring Engine
=============================================
Calculates deterministic, evidence-backed proficiency scores (0.0 to 100.0)
for skills based on verifiable evidence items across multiple sources.

Formula & Rules:
1. Recognized sources & default weights:
   - github: 0.35 (code commits, pull requests)
   - leetcode: 0.25 (algorithmic platform metrics)
   - assessment: 0.25 (college lab tests, institutional exams)
   - certificate: 0.15 (industry certifications)
   - project: 0.20 (capstone / course projects)
   - resume: 0.15 (self-declared resume experience)
   - text: 0.10 (general unverified text)

2. Confidence Aggregation:
   Average the source-level confidence values for a skill rather than
   allowing repeated items from one source to dominate:
   C_{s, src} = mean(confidence for skill s in source src)
   overall_confidence = mean(C_{s, src} across all distinct sources of skill s)

3. Source Quality Score (Q_{s, src}):
   n_{s, src} = total occurrences of skill s in source src
   freq_bonus = min(0.25, (n_{s, src} - 1) * 0.05)
   Q_{s, src} = min(1.0, C_{s, src} * (1.0 + freq_bonus))

4. Base Weighted Score (B_s):
   Normalized across active sources of skill s:
   B_s = 100 * sum(W_i * Q_{s, i}) / sum(W_i)

5. Multi-Source Corroboration Bonus (M_s):
   - 1 source: +0.0 pts
   - 2 sources: +5.0 pts
   - >= 3 sources: +10.0 pts
   final_score = min(100.0, round(B_s * 0.90 + M_s, 1))

6. Tiers & Levels:
   - >= 80.0: Level "Advanced", Tier "ready"
   - >= 60.0 and < 80.0: Level "Intermediate", Tier "in_progress"
   - < 60.0: Level "Beginner", Tier "needs_support"
"""

from typing import Dict, List, Optional, Tuple
from app.schemas.skill_schemas import (
    SkillEvidenceItem,
    ScoredSkill,
    SkillScoringResponse,
)
from app.core.taxonomy import SKILLS_TAXONOMY


# ── Default source weights aligned with Admin Governance Settings ───────────
DEFAULT_SOURCE_WEIGHTS: Dict[str, float] = {
    "github": 0.35,
    "leetcode": 0.25,
    "assessment": 0.25,
    "certificate": 0.15,
    "project": 0.20,
    "resume": 0.15,
    "text": 0.10,
}

RECOGNIZED_SOURCES = set(DEFAULT_SOURCE_WEIGHTS.keys())


def validate_and_resolve_weights(custom_weights: Optional[Dict[str, float]]) -> Dict[str, float]:
    """
    Validates custom source weights according to project rules:
    - Rejects unknown source names.
    - Rejects negative weights.
    - Rejects all-zero weights.
    - Falls back to default weights for recognized sources not explicitly overridden.
    """
    resolved = DEFAULT_SOURCE_WEIGHTS.copy()
    if custom_weights is not None:
        if not isinstance(custom_weights, dict):
            raise ValueError("source_weights must be a dictionary of source name to weight.")

        for src, weight in custom_weights.items():
            src_lower = src.lower().strip()
            if src_lower not in RECOGNIZED_SOURCES:
                raise ValueError(
                    f"Unknown source '{src}' in source_weights. Recognized sources are: {sorted(RECOGNIZED_SOURCES)}"
                )
            if not isinstance(weight, (int, float)):
                raise ValueError(f"Weight for source '{src}' must be a number, got {type(weight).__name__}.")
            if weight < 0.0:
                raise ValueError(f"Negative weight {weight} for source '{src}' is not allowed.")
            resolved[src_lower] = float(weight)

        if sum(resolved.values()) <= 0.0:
            raise ValueError("All source weights cannot be zero. At least one positive weight is required.")

    return resolved


def _canonicalize_skill_name(raw_name: str) -> str:
    """Resolve skill name to canonical taxonomy casing if recognized."""
    trimmed = raw_name.strip()
    lower = trimmed.lower()
    for canonical, data in SKILLS_TAXONOMY.items():
        if canonical.lower() == lower:
            return canonical
        for alias in data.get("aliases", []):
            if alias.lower() == lower:
                return canonical
    return trimmed


def _determine_skill_level(score: float) -> str:
    """Map individual skill score to proficiency level."""
    if score >= 80.0:
        return "Advanced"
    elif score >= 60.0:
        return "Intermediate"
    else:
        return "Beginner"


def _determine_readiness_tier(overall_score: float) -> str:
    """Map overall profile score to placement readiness tier."""
    if overall_score >= 80.0:
        return "ready"
    elif overall_score >= 60.0:
        return "in_progress"
    else:
        return "needs_support"


def score_skills(
    evidence_items: List[SkillEvidenceItem],
    source_weights: Optional[Dict[str, float]] = None,
) -> SkillScoringResponse:
    """
    Calculate deterministic proficiency scores for a collection of evidence items.
    """
    # 1. Validate weights
    weights = validate_and_resolve_weights(source_weights)

    if not evidence_items:
        return SkillScoringResponse(
            skills=[],
            overall_score=0.0,
            readiness_tier="needs_support",
            scored_count=0,
        )

    # 2. Group items by canonical skill name
    # structure: {skill_name: {source: [SkillEvidenceItem, ...]}}
    grouped: Dict[str, Dict[str, List[SkillEvidenceItem]]] = {}

    for item in evidence_items:
        src = item.source.lower().strip()
        if src not in RECOGNIZED_SOURCES:
            raise ValueError(
                f"Unknown evidence source '{item.source}'. Must be one of: {sorted(RECOGNIZED_SOURCES)}"
            )

        canonical = _canonicalize_skill_name(item.skill_name)
        if canonical not in grouped:
            grouped[canonical] = {}
        if src not in grouped[canonical]:
            grouped[canonical][src] = []
        grouped[canonical][src].append(item)

    scored_skills: List[ScoredSkill] = []

    # 3. Calculate score per skill
    for skill_name, sources_dict in grouped.items():
        active_sources = sorted(sources_dict.keys())
        source_confidences: Dict[str, float] = {}
        source_quality: Dict[str, float] = {}
        all_snippets: List[str] = []
        total_occurrences = 0

        # Step A: source-level aggregation
        for src, items in sources_dict.items():
            conf_sum = sum(it.confidence for it in items)
            src_conf = conf_sum / len(items)
            source_confidences[src] = src_conf

            src_occurrences = sum(it.occurrences for it in items)
            total_occurrences += src_occurrences

            # Frequency bonus with diminishing returns, capped at +0.25
            freq_bonus = min(0.25, (src_occurrences - 1) * 0.05)
            q = min(1.0, src_conf * (1.0 + freq_bonus))
            source_quality[src] = q

            for it in items:
                if it.evidence_snippet and it.evidence_snippet.strip():
                    snip = it.evidence_snippet.strip()
                    if snip not in all_snippets:
                        all_snippets.append(snip)

        # Step B: Source-balanced confidence (mean of source-level confidences)
        balanced_confidence = round(sum(source_confidences.values()) / len(source_confidences), 2)

        # Step C: Weighted average base score
        active_weight_sum = sum(weights[src] for src in active_sources)
        if active_weight_sum <= 0.0:
            raise ValueError(f"Active source weights sum to 0.0 for skill '{skill_name}'.")

        weighted_q_sum = sum(weights[src] * source_quality[src] for src in active_sources)
        base_score_100 = 100.0 * (weighted_q_sum / active_weight_sum)

        # Step D: Corroboration bonus & final score calculation
        num_sources = len(active_sources)
        if num_sources >= 3:
            corroboration_bonus = 10.0
        elif num_sources == 2:
            corroboration_bonus = 5.0
        else:
            corroboration_bonus = 0.0

        base_contribution_scaled = base_score_100 * 0.90
        final_score = min(100.0, round(base_contribution_scaled + corroboration_bonus, 1))

        # Step E: Breakdown of point contributions
        breakdown: Dict[str, float] = {}
        for src in active_sources:
            src_points = 100.0 * ((weights[src] * source_quality[src]) / active_weight_sum) * 0.90
            breakdown[src] = round(src_points, 1)
        breakdown["corroboration_bonus"] = corroboration_bonus

        level = _determine_skill_level(final_score)

        scored_skills.append(
            ScoredSkill(
                skill_name=skill_name,
                score=final_score,
                level=level,
                confidence=balanced_confidence,
                sources=active_sources,
                evidence_count=total_occurrences,
                evidence_snippets=all_snippets,
                breakdown=breakdown,
            )
        )

    # 4. Sort skills by score descending, then alphabetical
    scored_skills.sort(key=lambda s: (-s.score, s.skill_name))

    # 5. Overall score & readiness tier
    overall_score = round(sum(s.score for s in scored_skills) / len(scored_skills), 1)
    readiness_tier = _determine_readiness_tier(overall_score)

    return SkillScoringResponse(
        skills=scored_skills,
        overall_score=overall_score,
        readiness_tier=readiness_tier,
        scored_count=len(scored_skills),
    )

