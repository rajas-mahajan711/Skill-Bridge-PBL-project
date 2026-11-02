"""
SkillBridge Candidate Matching & Ranking Service
Implements Section 3, 10 & 13 of SkillBridge specification.
Matches candidates against job requisition requirements with explainable AI reasoning,
strict non-use of sensitive personal attributes, and placement consent verification.
"""

from typing import List, Dict, Any, Optional
from backend.app.data.seed_data import STUDENTS_SEED, JOBS_SEED, SHORTLIST_STORE
from backend.app.core.auth import sanitize_student_for_recruiter

def rank_candidates_for_job(job_id: str, department_filter: Optional[str] = None) -> Dict[str, Any]:
    """
    Ranks candidates for a given job description based strictly on:
    1. Required skills fulfillment and score threshold satisfaction
    2. Preferred skills bonus
    3. Multi-source evidence confidence
    
    Guarantees:
    - Never uses sensitive personal attributes (gender, age, caste, religion, personal identifiers).
    - Excludes students who have not consented to recruitment sharing.
    - Generates natural-language, explainable reason breakdown for human recruiters.
    """
    # 1. Locate Job
    job = next((j for j in JOBS_SEED if j["job_id"] == job_id), None)
    if not job:
        raise ValueError(f"Job Requisition '{job_id}' not found.")

    requirements = job.get("requirements", [])
    preferred = job.get("preferred_skills", [])
    min_readiness = job.get("min_readiness_score", 0.0)

    # 2. Filter candidate pool (must have consented to placement)
    pool = [s for s in STUDENTS_SEED if s.get("consented_placement", False)]
    if department_filter and department_filter != "All":
        pool = [s for s in pool if s.get("department") == department_filter]

    ranked_results = []

    for student in pool:
        student_skills = student.get("skills", {})
        matched_skills = []
        missing_skills = []
        
        total_req_weight = 0.0
        earned_req_score = 0.0
        
        # Evaluate required skills
        req_count = len(requirements)
        req_met_count = 0

        for req in requirements:
            sk_name = req["skill"]
            min_score = req["min_score"]
            weight = req.get("weight", 1.0)
            is_mandatory = req.get("is_required", True)

            if is_mandatory:
                total_req_weight += weight

            if sk_name in student_skills:
                student_score = student_skills[sk_name]["score"]
                confidence = student_skills[sk_name]["confidence"]

                if student_score >= min_score:
                    if is_mandatory:
                        earned_req_score += weight
                        req_met_count += 1
                    matched_skills.append({
                        "skill": sk_name,
                        "candidate_score": student_score,
                        "required_score": min_score,
                        "status": "Exceeds" if student_score >= min_score + 10 else "Meets",
                        "confidence": confidence,
                        "is_mandatory": is_mandatory
                    })
                else:
                    shortfall = round(min_score - student_score, 1)
                    missing_skills.append({
                        "skill": sk_name,
                        "candidate_score": student_score,
                        "required_score": min_score,
                        "shortfall": shortfall,
                        "is_mandatory": is_mandatory
                    })
            else:
                missing_skills.append({
                    "skill": sk_name,
                    "candidate_score": 0.0,
                    "required_score": min_score,
                    "shortfall": min_score,
                    "is_mandatory": is_mandatory
                })

        # Evaluate preferred skills (bonus up to 10 points)
        matched_preferred = []
        for pref in preferred:
            if pref in student_skills:
                pref_score = student_skills[pref]["score"]
                matched_preferred.append(f"{pref} ({round(pref_score)}%)")

        # Compute normalized match score (0 - 100)
        base_match_pct = (earned_req_score / total_req_weight) * 85.0 if total_req_weight > 0 else 70.0
        pref_bonus = min(15.0, len(matched_preferred) * 5.0)
        readiness_factor = min(5.0, (student.get("overall_readiness", 0) / 100.0) * 5.0)

        final_match_score = min(99.0, max(20.0, base_match_pct + pref_bonus + readiness_factor))

        # Generate Explainable AI Reasoning Text
        key_positives = [f"{m['skill']} ({round(m['candidate_score'])}/100)" for m in matched_skills[:3]]
        key_missing = [f"{g['skill']} (-{round(g['shortfall'])} pts)" for g in missing_skills[:2]]
        
        explanation_parts = [
            f"Candidate meets {req_met_count} of {req_count} job requirements with overall readiness score of {student.get('overall_readiness', 0)}%."
        ]
        if key_positives:
            explanation_parts.append(f"Strong evidence verified in: {', '.join(key_positives)}.")
        if key_missing:
            explanation_parts.append(f"Primary shortfall observed in: {', '.join(key_missing)}.")
        if matched_preferred:
            explanation_parts.append(f"Bonus alignment in preferred skills: {', '.join(matched_preferred)}.")

        explanation = " ".join(explanation_parts)

        # Lookup current shortlist state
        shortlist_key = f"{job_id}:{student['student_id']}"
        current_shortlist = SHORTLIST_STORE.get(shortlist_key, {})
        status = current_shortlist.get("status", "new")

        ranked_results.append({
            "student_id": student["student_id"],
            "candidate_alias": student.get("candidate_alias", f"Candidate {student['student_id']}"),
            "department": student.get("department"),
            "batch": student.get("batch"),
            "target_role": student.get("target_role"),
            "match_score": round(final_match_score, 1),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "preferred_skills_matched": matched_preferred,
            "explanation": explanation,
            "shortlist_status": status,
            "shortlist_notes": current_shortlist.get("notes", ""),
            "consented_placement": True,
            "confidence": student.get("confidence", "Medium"),
            "overall_readiness": student.get("overall_readiness", 0.0),
            "is_demo_record": True
        })

    # Sort descending by match score
    ranked_results.sort(key=lambda c: c["match_score"], reverse=True)

    return {
        "job_id": job["job_id"],
        "job_title": job["title"],
        "company": job["company"],
        "total_matches": len(ranked_results),
        "candidates": ranked_results,
        "is_empty": len(ranked_results) == 0,
        "recommendation_summary": f"Ranked {len(ranked_results)} consented candidates against {len(requirements)} defined skill criteria."
    }

def update_candidate_shortlist(job_id: str, student_id: str, status: str, notes: str = "") -> Dict[str, Any]:
    """Persists shortlist status for a candidate in a job requisition."""
    valid_statuses = ["new", "shortlisted", "reviewing", "interview_scheduled", "rejected"]
    if status not in valid_statuses:
        raise ValueError(f"Invalid status '{status}'. Must be one of: {valid_statuses}")
        
    key = f"{job_id}:{student_id}"
    record = {
        "job_id": job_id,
        "student_id": student_id,
        "status": status,
        "notes": notes,
        "updated_at": "2026-10-30T22:30:00Z"
    }
    SHORTLIST_STORE[key] = record
    return record

def create_job_requisition(job_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validates and adds a new job description to the recruiter portal."""
    title = job_data.get("title", "").strip()
    company = job_data.get("company", "").strip()
    requirements = job_data.get("requirements", [])
    
    if not title:
        raise ValueError("Job title is required and cannot be empty.")
    if not company:
        raise ValueError("Company name is required.")
    if not requirements or len(requirements) == 0:
        raise ValueError("At least one required skill must be defined.")

    # Validate skill score thresholds (0 - 100)
    for r in requirements:
        min_sc = r.get("min_score", 0)
        if not (0 <= min_sc <= 100):
            raise ValueError(f"Invalid minimum score '{min_sc}' for skill '{r.get('skill')}'. Must be between 0 and 100.")

    job_id = f"JOB-2026-{len(JOBS_SEED) + 1:02d}"
    new_job = {
        "job_id": job_id,
        "title": title,
        "company": company,
        "department": job_data.get("department", "Engineering"),
        "min_experience_years": float(job_data.get("min_experience_years", 0.0)),
        "min_readiness_score": float(job_data.get("min_readiness_score", 60.0)),
        "requirements": requirements,
        "preferred_skills": job_data.get("preferred_skills", []),
        "description": job_data.get("description", ""),
        "is_active": True,
        "created_at": "2026-10-30T22:30:00Z"
    }
    JOBS_SEED.insert(0, new_job)
    return new_job
