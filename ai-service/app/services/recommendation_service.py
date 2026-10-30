"""
Recommendation Service
Matches identified skill gaps to relevant learning resources and explains priority.
"""

from typing import List, Dict
from app.schemas import (
    SkillGapItem,
    LearningResourceInput,
    RecommendedResourceItem,
    RecommendationResponse,
)


class RecommendationService:
    @staticmethod
    def recommend_resources(
        identified_gaps: List[SkillGapItem],
        available_resources: List[LearningResourceInput],
        limit: int = 6,
    ) -> RecommendationResponse:
        recommended: List[RecommendedResourceItem] = []

        # Index gaps by lowercase skill name
        gap_map: Dict[str, SkillGapItem] = {
            g.skill_name.lower().strip(): g for g in identified_gaps
        }

        # Track which resources have been included
        seen_resource_ids = set()

        for res in available_resources:
            # Check if any target skill in this resource matches a gap
            for target_skill in res.target_skills:
                skill_key = target_skill.lower().strip()
                gap = gap_map.get(skill_key)

                if gap and gap.status in ("missing", "weak", "insufficient_evidence"):
                    res_key = res.id or res.title
                    if res_key in seen_resource_ids:
                        continue
                    seen_resource_ids.add(res_key)

                    if gap.status == "missing":
                        priority = "High"
                        reason = f"Essential for bridging your completely unevidenced gap in {gap.skill_name}."
                    elif gap.status == "weak":
                        priority = "High" if gap.importance == "required" else "Medium"
                        reason = f"Targeted practice to increase your proficiency from {gap.current_level or 0} to the required {gap.required_level}."
                    else:
                        priority = "Medium"
                        reason = f"Reinforces practical knowledge to build verifiable portfolio evidence in {gap.skill_name}."

                    recommended.append(
                        RecommendedResourceItem(
                            resource_id=res.id,
                            title=res.title,
                            description=res.description,
                            target_skill=gap.skill_name,
                            source_name=res.source_name,
                            source_url=res.source_url,
                            difficulty=res.difficulty or "Intermediate",
                            estimated_hours=res.estimated_hours,
                            relevance_reason=reason,
                            priority=priority,
                        )
                    )
                    break

        # Sort: High priority first
        priority_order = {"High": 0, "Medium": 1, "Low": 2}
        recommended.sort(key=lambda r: priority_order.get(r.priority, 3))

        return RecommendationResponse(
            success=True,
            recommended_resources=recommended[:limit],
        )
