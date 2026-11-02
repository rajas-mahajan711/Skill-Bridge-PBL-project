"""
SkillBridge Role-Based Access Control (RBAC) & Data Privacy Layer
Enforces Section 4 & 17 of the SkillBridge Specification.
Faculty/T&P and Recruiter boundaries are strictly enforced.
"""

from typing import Dict, Any, Optional, List
from enum import Enum

class UserRole(str, Enum):
    FACULTY_TP = "faculty_tp"
    RECRUITER = "recruiter"
    STUDENT = "student"
    ADMIN = "admin"

class AuthException(Exception):
    def __init__(self, message: str, status_code: int = 403):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

def verify_role_access(current_role: str, allowed_roles: List[str]) -> bool:
    """Validates that the caller's role is in the permitted role list."""
    if not current_role:
        raise AuthException("Authentication required. Missing role credential.", status_code=401)
    if current_role not in allowed_roles:
        raise AuthException(
            f"Access Forbidden: Role '{current_role}' is not authorized to access this resource. Allowed: {allowed_roles}",
            status_code=403
        )
    return True

def sanitize_student_for_recruiter(student: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitizes student data for Recruiter / Company consumption.
    Strict privacy safeguards:
    1. Rejects access if student has not explicitly consented to placement.
    2. Strips all sensitive personal attributes (no caste, religion, gender, age, personal addresses).
    3. Strips internal academic administrative notes, remedial course logs, and non-consented flags.
    4. Provides candidate alias (or anonymized identifier), department, batch, approved technical skills,
       verified portfolio links, and recruitment-approved evidence summaries.
    """
    if not student.get("consented_placement", False):
        raise AuthException("This candidate has not consented to share their profile with external recruiters.", status_code=403)
    
    # Extract only recruitment-approved public skill metrics
    public_skills = {}
    for skill_name, skill_data in student.get("skills", {}).items():
        public_skills[skill_name] = {
            "score": skill_data.get("score"),
            "confidence": skill_data.get("confidence"),
            "projects_count": skill_data.get("projects", 0),
            "verified_cert": skill_data.get("verified_cert", False),
            "internship_experience": skill_data.get("internship", False)
        }

    return {
        "student_id": student.get("student_id"),
        "candidate_alias": student.get("candidate_alias", f"Candidate-{student.get('student_id')}"),
        "department": student.get("department"),
        "batch": student.get("batch"),
        "target_role": student.get("target_role"),
        "overall_readiness": student.get("overall_readiness"),
        "confidence": student.get("confidence"),
        "consented_placement": True,
        "skills": public_skills,
        "evidence_summary": student.get("evidence_summary", "Technical assessment and project portfolio verified."),
        "is_demo_record": student.get("is_demo_record", False)
    }

def sanitize_student_for_faculty(student: Dict[str, Any]) -> Dict[str, Any]:
    """
    Full academic and assessment view authorized for Faculty and T&P administrators.
    Includes roll numbers, academic performance, training enrollment, pre/post training progress,
    and granular evidence scoring for academic evaluation.
    """
    return {
        "student_id": student.get("student_id"),
        "roll_number": student.get("roll_number"),
        "full_name": student.get("full_name"),
        "candidate_alias": student.get("candidate_alias"),
        "department": student.get("department"),
        "batch": student.get("batch"),
        "target_role": student.get("target_role"),
        "cgpa": student.get("cgpa"),
        "consented_placement": student.get("consented_placement"),
        "overall_readiness": student.get("overall_readiness"),
        "readiness_tier": student.get("readiness_tier"),
        "confidence": student.get("confidence"),
        "skills": student.get("skills", {}),
        "training_progress": student.get("training_progress", {}),
        "evidence_summary": student.get("evidence_summary", ""),
        "is_demo_record": student.get("is_demo_record", False)
    }
