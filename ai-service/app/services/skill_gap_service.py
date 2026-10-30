"""
Skill Gap Analysis Service
Evaluates student evidence against role requirements and clearly categorizes gaps:
- Meeting: Meets or exceeds required proficiency with sufficient confidence
- Weak: Evidence exists but proficiency falls below minimum requirement
- Insufficient Evidence: Claims or preliminary records exist, but confidence is low
- Missing: No evidence or records present for this required competency
"""

from typing import List, Dict
from app.schemas import (
    RoleDefinitionInput,
    SkillScoreResult,
    SkillGapItem,
    SkillGapAnalysisResponse,
)

WHY_IT_MATTERS_LOOKUP = {
    "react": "React is foundational for building modern, stateful single-page applications and component architectures.",
    "typescript": "TypeScript adds static typing, reducing runtime errors and improving maintainability in enterprise codebases.",
    "node.js": "Node.js provides non-blocking, asynchronous backend runtimes essential for scalable microservices.",
    "express.js": "Express is the primary HTTP routing and middleware framework used across Node.js web services.",
    "mongodb": "MongoDB provides flexible NoSQL document storage critical for rapid iteration and hierarchical data models.",
    "python": "Python is the core language for automation, data engineering, machine learning pipelines, and backend APIs.",
    "fastapi": "FastAPI enables high-performance asynchronous RESTful APIs with native OpenAPI documentation.",
    "sql": "Relational data querying and transactional schemas remain indispensable for data analysis and backend systems.",
    "git": "Version control and branching strategies are mandatory for collaborative software engineering workflows.",
    "rest apis": "Clean API contract design and status code conventions ensure interoperability between client and server layers.",
    "docker": "Containerization standardizes local development and cloud production deployment environments.",
    "data structures & algorithms": "Core algorithmic problem-solving evaluates runtime efficiency and memory optimization in technical interviews.",
}


class SkillGapService:
    @staticmethod
    def analyze_gaps(
        target_role: RoleDefinitionInput,
        student_skills: List[SkillScoreResult],
    ) -> SkillGapAnalysisResponse:
        """
        Calculates gap breakdown and weighted readiness score.
        """
        # Map student skills by normalized name
        student_skill_map: Dict[str, SkillScoreResult] = {
            s.skill_name.lower().strip(): s for s in student_skills
        }

        gaps: List[SkillGapItem] = []
        total_weight = 0.0
        achieved_weight = 0.0

        meeting_count = 0
        weak_count = 0
        insufficient_count = 0
        missing_count = 0

        for req in target_role.required_skills:
            skill_key = req.skill_name.lower().strip()
            student_eval = student_skill_map.get(skill_key)

            # Weight by importance
            importance_weight = 1.5 if req.importance == "required" else 1.0
            total_weight += importance_weight

            why_matters = WHY_IT_MATTERS_LOOKUP.get(
                skill_key,
                f"{req.skill_name} is an important competency for modern {target_role.title} positions."
            )

            if student_eval is None:
                # Skill is completely missing
                missing_count += 1
                gaps.append(
                    SkillGapItem(
                        skill_name=req.skill_name,
                        category=req.category or "Technical",
                        status="missing",
                        current_level=None,
                        required_level=req.min_level,
                        importance=req.importance,
                        confidence_level="None",
                        evidence_count=0,
                        gap_difference=round(req.min_level, 1),
                        why_it_matters=why_matters,
                        suggested_action=f"Add a verified project or complete a beginner assessment in {req.skill_name}.",
                    )
                )
            elif student_eval.status == "insufficient_evidence" or student_eval.score is None:
                # Evidence exists but unverified or too sparse
                insufficient_count += 1
                partial_credit = 0.25 * importance_weight
                achieved_weight += partial_credit
                gaps.append(
                    SkillGapItem(
                        skill_name=req.skill_name,
                        category=req.category or "Technical",
                        status="insufficient_evidence",
                        current_level=student_eval.score,
                        required_level=req.min_level,
                        importance=req.importance,
                        confidence_level=student_eval.confidence_level,
                        evidence_count=student_eval.supporting_evidence_count,
                        gap_difference=round(req.min_level, 1),
                        why_it_matters=why_matters,
                        suggested_action=f"Submit GitHub repository links or verified certificates to elevate confidence for {req.skill_name}.",
                    )
                )
            elif student_eval.score < req.min_level:
                # Skill is weak (below threshold)
                weak_count += 1
                diff = round(req.min_level - student_eval.score, 1)
                fraction = max(student_eval.score / req.min_level, 0.0)
                achieved_weight += fraction * importance_weight
                gaps.append(
                    SkillGapItem(
                        skill_name=req.skill_name,
                        category=req.category or "Technical",
                        status="weak",
                        current_level=student_eval.score,
                        required_level=req.min_level,
                        importance=req.importance,
                        confidence_level=student_eval.confidence_level,
                        evidence_count=student_eval.supporting_evidence_count,
                        gap_difference=diff,
                        why_it_matters=why_matters,
                        suggested_action=f"Improve proficiency by {diff} pts through advanced practice modules or assessment challenges.",
                    )
                )
            else:
                # Skill is meeting or exceeding requirements
                meeting_count += 1
                achieved_weight += 1.0 * importance_weight
                gaps.append(
                    SkillGapItem(
                        skill_name=req.skill_name,
                        category=req.category or "Technical",
                        status="meeting",
                        current_level=student_eval.score,
                        required_level=req.min_level,
                        importance=req.importance,
                        confidence_level=student_eval.confidence_level,
                        evidence_count=student_eval.supporting_evidence_count,
                        gap_difference=0.0,
                        why_it_matters=why_matters,
                        suggested_action="Requirement satisfied. Maintain active projects or explore advanced specialized topics.",
                    )
                )

        # Compute readiness score (0-100)
        raw_readiness = (achieved_weight / total_weight * 100.0) if total_weight > 0 else 0.0
        readiness_score = round(min(max(raw_readiness, 0.0), 100.0), 1)

        if readiness_score >= 80.0:
            readiness_band = "High Readiness"
        elif readiness_score >= 60.0:
            readiness_band = "Moderate Readiness"
        elif readiness_score >= 40.0:
            readiness_band = "Developing"
        else:
            readiness_band = "Early Stage"

        calculation_summary = (
            f"Readiness of {readiness_score}% calculated across {len(target_role.required_skills)} required skill competencies. "
            f"{meeting_count} meeting, {weak_count} below threshold, {insufficient_count} with low evidence confidence, and {missing_count} unevidenced."
        )

        disclaimer = (
            "Skill readiness indicates current portfolio alignment with baseline role expectations. "
            "It is an educational benchmark and does not guarantee job placement or interview invitations."
        )

        # Sort gaps: missing & weak first, then insufficient, then meeting
        status_priority = {"missing": 0, "weak": 1, "insufficient_evidence": 2, "meeting": 3}
        gaps.sort(key=lambda g: (status_priority.get(g.status, 4), -g.gap_difference))

        return SkillGapAnalysisResponse(
            success=True,
            role_title=target_role.title,
            readiness_score=readiness_score,
            readiness_band=readiness_band,
            total_required_skills=len(target_role.required_skills),
            skills_meeting_count=meeting_count,
            skills_weak_count=weak_count,
            skills_insufficient_count=insufficient_count,
            skills_missing_count=missing_count,
            gaps=gaps,
            calculation_summary=calculation_summary,
            disclaimer=disclaimer,
        )
