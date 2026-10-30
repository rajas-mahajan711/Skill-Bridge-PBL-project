"""
Scoring and Confidence Service
Implements transparent, deterministic, evidence-backed skill evaluation.
Differentiates between proficiency score and evidence confidence.
"""

from typing import List, Dict, Optional, Tuple
from collections import defaultdict
from app.schemas import EvidenceItem, SkillScoreResult

# Base proficiency ratings by evidence type (when no explicit test score is present)
EVIDENCE_TYPE_BASE_RATINGS = {
    "assessment": 85.0,
    "internship": 80.0,
    "project": 75.0,
    "coding_profile": 78.0,
    "achievement": 72.0,
    "certificate": 65.0,
    "resume": 45.0,
}

# Verification multipliers
VERIFICATION_MULTIPLIERS = {
    "verified": 1.0,
    "pending": 0.75,
    "unverified": 0.50,
    "rejected": 0.0,
}

# Weight assigned to each evidence type in weighted score averaging
EVIDENCE_TYPE_WEIGHTS = {
    "assessment": 1.4,
    "internship": 1.2,
    "project": 1.1,
    "coding_profile": 1.0,
    "achievement": 0.9,
    "certificate": 0.7,
    "resume": 0.4,
}


class ScoringService:
    @staticmethod
    def evaluate_skills(
        evidence_items: List[EvidenceItem],
        target_skills: Optional[List[str]] = None,
    ) -> List[SkillScoreResult]:
        """
        Groups evidence by skill, computes evidence-backed proficiency and confidence.
        Does not fabricate scores where evidence is insufficient.
        """
        # Map skill (normalized lower) -> list of evidence items
        skill_evidence_map: Dict[str, List[EvidenceItem]] = defaultdict(list)
        skill_name_canonical: Dict[str, str] = {}

        for item in evidence_items:
            # Skip completely rejected evidence
            if item.verification_status.lower() == "rejected":
                continue

            for raw_skill in item.related_skills:
                trimmed = raw_skill.strip()
                if not trimmed:
                    continue
                key = trimmed.lower()
                if key not in skill_name_canonical:
                    skill_name_canonical[key] = trimmed
                skill_evidence_map[key].append(item)

        # Include any requested target skills even if no evidence exists
        if target_skills:
            for ts in target_skills:
                trimmed = ts.strip()
                if not trimmed:
                    continue
                key = trimmed.lower()
                if key not in skill_evidence_map:
                    skill_evidence_map[key] = []
                    skill_name_canonical[key] = trimmed

        results: List[SkillScoreResult] = []

        for skill_key, items in skill_evidence_map.items():
            canonical_name = skill_name_canonical[skill_key]
            result = ScoringService._calculate_single_skill(canonical_name, items)
            results.append(result)

        # Sort: evaluated first by score desc, then insufficient evidence
        results.sort(
            key=lambda r: (r.status == "evaluated", r.score or 0.0, r.supporting_evidence_count),
            reverse=True,
        )

        return results

    @staticmethod
    def _calculate_single_skill(skill_name: str, items: List[EvidenceItem]) -> SkillScoreResult:
        """
        Calculates score, confidence, and explanatory breakdown for a single skill.
        """
        if not items:
            return SkillScoreResult(
                skill_name=skill_name,
                score=None,
                confidence_score=0.0,
                confidence_level="Low",
                supporting_evidence_count=0,
                evidence_sources=[],
                last_updated=None,
                explanation="No verified or pending evidence submitted for this skill yet.",
                limitations="Self-reported or missing; requires at least one project, assessment, or certificate.",
                status="insufficient_evidence",
            )

        # Track sources and unique types
        unique_sources = set()
        unique_types = set()
        verified_count = 0
        total_weighted_score = 0.0
        total_weight = 0.0
        most_recent_date = None

        for item in items:
            itype = item.type.lower()
            vstatus = item.verification_status.lower()

            if item.source:
                unique_sources.add(item.source)
            unique_types.add(itype)

            if vstatus == "verified":
                verified_count += 1

            if item.evidence_date:
                if most_recent_date is None or item.evidence_date > most_recent_date:
                    most_recent_date = item.evidence_date

            # Item raw score: assessment score if provided, otherwise base type rating
            raw_val = item.score if (item.score is not None and item.score > 0) else EVIDENCE_TYPE_BASE_RATINGS.get(itype, 60.0)
            v_mult = VERIFICATION_MULTIPLIERS.get(vstatus, 0.5)
            weight = EVIDENCE_TYPE_WEIGHTS.get(itype, 0.8) * v_mult

            if weight > 0:
                total_weighted_score += raw_val * weight
                total_weight += weight

        if total_weight <= 0.2:
            return SkillScoreResult(
                skill_name=skill_name,
                score=None,
                confidence_score=0.1,
                confidence_level="Low",
                supporting_evidence_count=len(items),
                evidence_sources=list(unique_sources),
                last_updated=most_recent_date,
                explanation=f"Found {len(items)} unverified record(s), but confidence is too low to compute a reliable proficiency score.",
                limitations="All submitted items are unverified or self-reported.",
                status="insufficient_evidence",
            )

        # Calculated proficiency (capped between 20 and 98)
        calculated_score = round(min(max(total_weighted_score / total_weight, 20.0), 98.0), 1)

        # Confidence computation: based on source diversity, verification ratio, and quantity
        diversity_factor = min(len(unique_types) / 3.0, 1.0) * 0.35
        verification_factor = (verified_count / len(items)) * 0.40
        quantity_factor = min(len(items) / 4.0, 1.0) * 0.25

        confidence_score = round(min(diversity_factor + verification_factor + quantity_factor, 1.0), 2)

        if confidence_score >= 0.75:
            confidence_level = "High"
        elif confidence_score >= 0.45:
            confidence_level = "Medium"
        else:
            confidence_level = "Low"

        # Construct explainable rationale
        explanation_parts = [
            f"Proficiency score of {calculated_score}/100 synthesized from {len(items)} evidence item(s) across {len(unique_types)} distinct categories ({', '.join(sorted(unique_types))}).",
        ]
        if verified_count > 0:
            explanation_parts.append(f"{verified_count} of {len(items)} evidence record(s) have been independently verified.")
        else:
            explanation_parts.append("Evidence is pending verification; score reflects provisional unverified estimates.")

        limitations = (
            "Scores represent estimated practical ability based on current portfolio evidence. "
            "They do not guarantee placement outcomes or replace live technical interviews."
        )

        return SkillScoreResult(
            skill_name=skill_name,
            score=calculated_score,
            confidence_score=confidence_score,
            confidence_level=confidence_level,
            supporting_evidence_count=len(items),
            evidence_sources=sorted(list(unique_sources)),
            last_updated=most_recent_date,
            explanation=" ".join(explanation_parts),
            limitations=limitations,
            status="evaluated",
        )
