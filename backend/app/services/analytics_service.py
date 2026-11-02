"""
SkillBridge Faculty & T&P Analytics Service
Implements batch-level skill distribution, common skill gap analytics,
readiness summaries, and training cohort tracking.
"""

from typing import List, Dict, Any, Optional
from backend.app.data.seed_data import STUDENTS_SEED, SKILL_TAXONOMY, DEPARTMENTS, BATCHES, TARGET_ROLES

def filter_students(
    department: Optional[str] = None,
    batch: Optional[str] = None,
    target_role: Optional[str] = None,
    skill: Optional[str] = None,
    readiness_tier: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Filters students strictly using attributes present in the agreed data model."""
    filtered = list(STUDENTS_SEED)
    
    if department and department != "All":
        filtered = [s for s in filtered if s.get("department") == department]
        
    if batch and batch != "All":
        filtered = [s for s in filtered if s.get("batch") == batch]
        
    if target_role and target_role != "All":
        filtered = [s for s in filtered if s.get("target_role") == target_role]
        
    if skill and skill != "All":
        filtered = [s for s in filtered if skill in s.get("skills", {})]
        
    if readiness_tier and readiness_tier != "All":
        filtered = [s for s in filtered if s.get("readiness_tier") == readiness_tier]
        
    return filtered

def compute_batch_analytics(
    department: Optional[str] = None,
    batch: Optional[str] = None,
    target_role: Optional[str] = None,
    skill: Optional[str] = None
) -> Dict[str, Any]:
    """
    Computes comprehensive batch analytics:
    1. Skill distribution (by domain & proficiency band)
    2. Common skill gaps vs role baselines
    3. Placement readiness breakdown
    4. Active filter echoes & cohort size
    """
    students = filter_students(department=department, batch=batch, target_role=target_role, skill=skill)
    total_students = len(students)

    if total_students == 0:
        return {
            "total_students": 0,
            "readiness_summary": {
                "job_ready_count": 0,
                "near_ready_count": 0,
                "needs_upskilling_count": 0,
                "job_ready_pct": 0.0,
                "avg_readiness_score": 0.0
            },
            "skill_distribution": {},
            "common_skill_gaps": [],
            "filters_applied": {
                "department": department or "All",
                "batch": batch or "All",
                "target_role": target_role or "All",
                "skill": skill or "All"
            },
            "is_empty": True
        }

    # Readiness Summary
    job_ready = sum(1 for s in students if s.get("readiness_tier") == "Job Ready")
    near_ready = sum(1 for s in students if s.get("readiness_tier") == "Near Ready")
    needs_upskilling = sum(1 for s in students if s.get("readiness_tier") == "Needs Upskilling")
    avg_readiness = sum(s.get("overall_readiness", 0) for s in students) / total_students

    # Skill Category Distributions and Averages
    all_skills_scores: Dict[str, List[float]] = {}
    for s in students:
        for sk_name, sk_data in s.get("skills", {}).items():
            all_skills_scores.setdefault(sk_name, []).append(sk_data.get("score", 0))

    skill_distribution = {}
    for category, cat_skills in SKILL_TAXONOMY.items():
        cat_scores = []
        for sk in cat_skills:
            if sk in all_skills_scores:
                cat_scores.extend(all_skills_scores[sk])
        
        avg_score = sum(cat_scores) / len(cat_scores) if cat_scores else 0.0
        skill_distribution[category] = {
            "category_name": category,
            "average_score": round(avg_score, 1),
            "tracked_skills": [sk for sk in cat_skills if sk in all_skills_scores],
            "proficiency_band": "Advanced" if avg_score >= 80 else "Intermediate" if avg_score >= 60 else "Developing"
        }

    # Common Skill Gaps Calculation (Benchmark = 75 for industry readiness)
    BENCHMARK = 75.0
    gaps = []
    for sk_name, scores in all_skills_scores.items():
        avg = sum(scores) / len(scores)
        gap = BENCHMARK - avg
        shortfall_students = sum(1 for sc in scores if sc < BENCHMARK)
        if gap > 0:
            priority = "Critical" if gap > 20 else "Moderate" if gap > 10 else "Low"
            gaps.append({
                "skill": sk_name,
                "avg_score": round(avg, 1),
                "benchmark_score": BENCHMARK,
                "gap": round(gap, 1),
                "affected_students": shortfall_students,
                "affected_percentage": round((shortfall_students / total_students) * 100, 1),
                "priority": priority
            })

    # Sort gaps by greatest shortfall
    gaps.sort(key=lambda x: x["gap"], reverse=True)

    return {
        "total_students": total_students,
        "readiness_summary": {
            "job_ready_count": job_ready,
            "near_ready_count": near_ready,
            "needs_upskilling_count": needs_upskilling,
            "job_ready_pct": round((job_ready / total_students) * 100, 1),
            "avg_readiness_score": round(avg_readiness, 1)
        },
        "skill_distribution": skill_distribution,
        "common_skill_gaps": gaps,
        "filters_applied": {
            "department": department or "All",
            "batch": batch or "All",
            "target_role": target_role or "All",
            "skill": skill or "All"
        },
        "available_filter_options": {
            "departments": ["All"] + DEPARTMENTS,
            "batches": ["All"] + BATCHES,
            "target_roles": ["All"] + TARGET_ROLES,
            "skills": ["All", "Python", "SQL", "REST API", "Docker", "DSA", "React", "AWS", "FastAPI"]
        },
        "is_empty": False
    }

def get_training_progress_summary(department: Optional[str] = None, batch: Optional[str] = None) -> Dict[str, Any]:
    """Calculates pre vs post training improvement metrics for T&P training cohorts."""
    students = filter_students(department=department, batch=batch)
    if not students:
        return {"cohorts": [], "overall_gain": 0.0, "total_enrolled": 0}

    total_pre = 0.0
    total_post = 0.0
    cohort_list = []

    for s in students:
        tp = s.get("training_progress", {})
        pre = tp.get("pre_score", 0.0)
        post = tp.get("post_score", 0.0)
        total_pre += pre
        total_post += post
        
        cohort_list.append({
            "student_id": s.get("student_id"),
            "full_name": s.get("full_name"),
            "department": s.get("department"),
            "batch": s.get("batch"),
            "enrolled_courses": tp.get("enrolled_courses", []),
            "completed_courses": tp.get("completed_courses", []),
            "pre_score": pre,
            "post_score": post,
            "score_gain": round(post - pre, 1),
            "completion_rate": tp.get("completion_rate", 0)
        })

    avg_gain = round((total_post - total_pre) / len(students), 1)

    return {
        "cohorts": cohort_list,
        "overall_average_gain": avg_gain,
        "total_enrolled": len(students),
        "avg_completion_rate": round(sum(c["completion_rate"] for c in cohort_list) / len(cohort_list), 1)
    }

def export_batch_readiness_csv(department: Optional[str] = None, batch: Optional[str] = None) -> str:
    """
    Generates role-safe CSV representation of student readiness.
    Exports only safe fields (never private credentials or sensitive personal items).
    """
    students = filter_students(department=department, batch=batch)
    headers = ["StudentID", "RollNumber", "FullName", "Department", "Batch", "TargetRole", "OverallReadiness", "ReadinessTier", "Confidence", "DemoRecord"]
    rows = [",".join(headers)]
    
    for s in students:
        row = [
            s.get("student_id", ""),
            s.get("roll_number", ""),
            f'"{s.get("full_name", "")}"',
            f'"{s.get("department", "")}"',
            s.get("batch", ""),
            f'"{s.get("target_role", "")}"',
            str(s.get("overall_readiness", 0)),
            s.get("readiness_tier", ""),
            s.get("confidence", ""),
            str(s.get("is_demo_record", True))
        ]
        rows.append(",".join(row))
        
    return "\n".join(rows)
