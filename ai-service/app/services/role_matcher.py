"""
Role Matching Service
Compares student skill portfolio across multiple career roles to provide ranked recommendations.
"""

from typing import List
from app.schemas import (
    SkillScoreResult,
    RoleDefinitionInput,
    RoleMatchItem,
    RoleMatchResponse,
)
from app.services.skill_gap_service import SkillGapService


class RoleMatcher:
    @staticmethod
    def match_roles(
        student_skills: List[SkillScoreResult],
        available_roles: List[RoleDefinitionInput],
    ) -> RoleMatchResponse:
        matches: List[RoleMatchItem] = []

        for role in available_roles:
            analysis = SkillGapService.analyze_gaps(role, student_skills)

            matching_skills = [g.skill_name for g in analysis.gaps if g.status == "meeting"]
            missing_skills = [g.skill_name for g in analysis.gaps if g.status == "missing"]
            weak_skills = [g.skill_name for g in analysis.gaps if g.status == "weak"]

            total_reqs = max(len(role.required_skills), 1)
            match_percentage = round((len(matching_skills) / total_reqs) * 100.0, 1)

            reasons: List[str] = []
            if matching_skills:
                reasons.append(f"Demonstrates strong evidence in {', '.join(matching_skills[:3])}.")
            if analysis.readiness_score >= 60.0:
                reasons.append(f"High portfolio readiness ({analysis.readiness_score}%) with required stack.")
            if missing_skills:
                reasons.append(f"Needs evidence for {len(missing_skills)} remaining required skill(s): {', '.join(missing_skills[:2])}.")

            matches.append(
                RoleMatchItem(
                    role_id=role.role_id,
                    role_title=role.title,
                    match_percentage=match_percentage,
                    readiness_score=analysis.readiness_score,
                    matching_skills=matching_skills,
                    missing_skills=missing_skills,
                    weak_skills=weak_skills,
                    reasons=reasons,
                )
            )

        # Sort roles by readiness score desc, then match percentage desc
        matches.sort(key=lambda m: (m.readiness_score, m.match_percentage), reverse=True)

        return RoleMatchResponse(success=True, recommendations=matches)
