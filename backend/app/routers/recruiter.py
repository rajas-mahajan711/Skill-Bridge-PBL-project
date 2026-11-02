"""
SkillBridge Recruiter & Company Portal Router
Exposes job description posting, candidate ranking with explainable scoring,
shortlist status persistence, and consented-candidate detail views.
Protected by Recruiter role authorization and privacy safeguards.
"""

from typing import Optional, Dict, Any, List
from backend.app.core.auth import verify_role_access, sanitize_student_for_recruiter, AuthException
from backend.app.services.matching_service import (
    rank_candidates_for_job,
    update_candidate_shortlist,
    create_job_requisition
)
from backend.app.data.seed_data import STUDENTS_SEED, JOBS_SEED, SHORTLIST_STORE

def handle_recruiter_request(
    path: str,
    method: str = "GET",
    query_params: Optional[Dict[str, str]] = None,
    body: Optional[Dict[str, Any]] = None,
    user_role: str = "recruiter"
) -> Dict[str, Any]:
    """
    Core dispatcher for Recruiter / Company routes.
    Can be mounted into FastAPI or run standalone.
    """
    # 1. Enforce Role Authorization
    verify_role_access(user_role, ["recruiter", "admin"])

    params = query_params or {}

    # Jobs List & Creation
    if path == "/api/v1/recruiter/jobs":
        if method == "GET":
            return {
                "status": "success",
                "total": len(JOBS_SEED),
                "jobs": JOBS_SEED
            }
        elif method == "POST":
            if not body:
                return {"status": "error", "message": "Request body cannot be empty.", "code": 400}
            try:
                new_job = create_job_requisition(body)
                return {"status": "success", "message": "Job requisition created successfully", "job": new_job}
            except ValueError as ve:
                return {"status": "error", "message": str(ve), "code": 422}

    # Job Details
    elif path.startswith("/api/v1/recruiter/jobs/") and not path.endswith("/candidates"):
        job_id = path.replace("/api/v1/recruiter/jobs/", "").strip()
        job = next((j for j in JOBS_SEED if j["job_id"] == job_id), None)
        if not job:
            return {"status": "error", "message": f"Job requisition '{job_id}' not found.", "code": 404}
        return {"status": "success", "job": job}

    # Ranked Candidates for Job
    elif path.startswith("/api/v1/recruiter/jobs/") and path.endswith("/candidates"):
        # e.g., /api/v1/recruiter/jobs/JOB-2026-01/candidates
        parts = path.split("/")
        job_id = parts[5] if len(parts) > 5 else ""
        dept_filter = params.get("department")

        try:
            ranking_result = rank_candidates_for_job(job_id=job_id, department_filter=dept_filter)
            return {"status": "success", "data": ranking_result}
        except ValueError as ve:
            return {"status": "error", "message": str(ve), "code": 404}

    # Recruiter Candidate Detail (Subject to explicit placement consent and data minimization)
    elif path.startswith("/api/v1/recruiter/candidates/"):
        candidate_id = path.replace("/api/v1/recruiter/candidates/", "").strip()
        student = next((s for s in STUDENTS_SEED if s["student_id"] == candidate_id), None)
        if not student:
            return {"status": "error", "message": f"Candidate '{candidate_id}' not found.", "code": 404}
        try:
            sanitized = sanitize_student_for_recruiter(student)
            return {"status": "success", "candidate": sanitized}
        except AuthException as ae:
            return {"status": "error", "message": ae.message, "code": ae.status_code}

    # Shortlist Management
    elif path == "/api/v1/recruiter/shortlist":
        if method == "POST":
            if not body:
                return {"status": "error", "message": "Request body cannot be empty.", "code": 400}
            job_id = body.get("job_id")
            student_id = body.get("student_id")
            status = body.get("status")
            notes = body.get("notes", "")

            if not job_id or not student_id or not status:
                return {"status": "error", "message": "Missing job_id, student_id or status", "code": 422}

            try:
                record = update_candidate_shortlist(job_id, student_id, status, notes)
                return {"status": "success", "message": "Candidate shortlist updated", "record": record}
            except ValueError as ve:
                return {"status": "error", "message": str(ve), "code": 422}

        elif method == "GET":
            # List all shortlisted candidates across jobs
            records = list(SHORTLIST_STORE.values())
            enriched = []
            for r in records:
                job = next((j for j in JOBS_SEED if j["job_id"] == r["job_id"]), None)
                student = next((s for s in STUDENTS_SEED if s["student_id"] == r["student_id"]), None)
                if student and student.get("consented_placement"):
                    enriched.append({
                        **r,
                        "job_title": job["title"] if job else "Unknown Requisition",
                        "candidate_alias": student.get("candidate_alias"),
                        "department": student.get("department"),
                        "batch": student.get("batch"),
                        "overall_readiness": student.get("overall_readiness")
                    })
            return {"status": "success", "total": len(enriched), "shortlisted": enriched}

    return {"status": "error", "message": f"Endpoint '{path}' not found on Recruiter router.", "code": 404}
