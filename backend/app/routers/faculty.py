"""
SkillBridge Faculty & T&P Router
Exposes batch analytics, common skill gaps, training progress,
student readiness dossier, and role-safe report exports.
Protected by Faculty / T&P role authorization.
"""

from typing import Optional, Dict, Any
from backend.app.core.auth import verify_role_access, sanitize_student_for_faculty, AuthException
from backend.app.services.analytics_service import (
    compute_batch_analytics,
    get_training_progress_summary,
    filter_students,
    export_batch_readiness_csv
)
from backend.app.data.seed_data import STUDENTS_SEED

def handle_faculty_request(
    path: str,
    method: str = "GET",
    query_params: Optional[Dict[str, str]] = None,
    body: Optional[Dict[str, Any]] = None,
    user_role: str = "faculty_tp"
) -> Dict[str, Any]:
    """
    Core dispatcher for Faculty / T&P routes.
    Can be mounted into FastAPI or run standalone.
    """
    # 1. Enforce Role Authorization
    verify_role_access(user_role, ["faculty_tp", "admin"])

    params = query_params or {}
    department = params.get("department")
    batch = params.get("batch")
    target_role = params.get("target_role")
    skill = params.get("skill")
    readiness_tier = params.get("readiness_tier")

    if path == "/api/v1/faculty/analytics/batch" and method == "GET":
        data = compute_batch_analytics(
            department=department,
            batch=batch,
            target_role=target_role,
            skill=skill
        )
        return {"status": "success", "data": data}

    elif path == "/api/v1/faculty/analytics/training-progress" and method == "GET":
        data = get_training_progress_summary(department=department, batch=batch)
        return {"status": "success", "data": data}

    elif path == "/api/v1/faculty/students" and method == "GET":
        students = filter_students(
            department=department,
            batch=batch,
            target_role=target_role,
            skill=skill,
            readiness_tier=readiness_tier
        )
        sanitized = [sanitize_student_for_faculty(s) for s in students]
        return {
            "status": "success",
            "total": len(sanitized),
            "students": sanitized,
            "is_empty": len(sanitized) == 0
        }

    elif path.startswith("/api/v1/faculty/students/") and method == "GET":
        student_id = path.replace("/api/v1/faculty/students/", "").strip()
        student = next((s for s in STUDENTS_SEED if s["student_id"] == student_id), None)
        if not student:
            return {"status": "error", "message": f"Student '{student_id}' not found", "code": 404}
        return {"status": "success", "student": sanitize_student_for_faculty(student)}

    elif path == "/api/v1/faculty/reports/export" and method == "GET":
        csv_content = export_batch_readiness_csv(department=department, batch=batch)
        return {
            "status": "success",
            "content_type": "text/csv",
            "filename": f"skillbridge_readiness_{batch or 'all'}.csv",
            "csv_content": csv_content
        }

    return {"status": "error", "message": f"Endpoint '{path}' not found on Faculty router.", "code": 404}
