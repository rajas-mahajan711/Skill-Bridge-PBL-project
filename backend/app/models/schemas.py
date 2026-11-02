"""
SkillBridge Data Models and Schemas
Aligns with Section 6, 8, 13 & 16 of the SkillBridge Project Specification.
"""

from typing import List, Optional, Dict, Any
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    FACULTY_TP = "faculty_tp"
    RECRUITER = "recruiter"
    ADMIN = "admin"

class ConfidenceLevel(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"

class ReadinessTier(str, Enum):
    JOB_READY = "Job Ready"
    NEAR_READY = "Near Ready"
    NEEDS_UPSKILLING = "Needs Upskilling"

class ShortlistStatus(str, Enum):
    NEW = "new"
    SHORTLISTED = "shortlisted"
    REVIEWING = "reviewing"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    REJECTED = "rejected"

# --- Faculty / T&P Schemas ---

class SkillGapItem:
    def __init__(self, skill: str, avg_score: float, required_score: float, gap: float, affected_students: int, priority: str):
        self.skill = skill
        self.avg_score = avg_score
        self.required_score = required_score
        self.gap = gap
        self.affected_students = affected_students
        self.priority = priority

    def to_dict(self) -> Dict[str, Any]:
        return {
            "skill": self.skill,
            "avg_score": round(self.avg_score, 1),
            "required_score": round(self.required_score, 1),
            "gap": round(self.gap, 1),
            "affected_students": self.affected_students,
            "priority": self.priority
        }

class BatchFilterParams:
    def __init__(self, department: Optional[str] = None, batch: Optional[str] = None, 
                 target_role: Optional[str] = None, skill: Optional[str] = None,
                 readiness_tier: Optional[str] = None):
        self.department = department
        self.batch = batch
        self.target_role = target_role
        self.skill = skill
        self.readiness_tier = readiness_tier

class StudentSkillEvidence:
    def __init__(self, skill_name: str, score: float, confidence: str, 
                 assessment_score: Optional[float] = None,
                 github_commits: Optional[int] = None,
                 project_count: Optional[int] = None,
                 verified_cert: bool = False,
                 internship_exp: bool = False,
                 evidence_summary: str = ""):
        self.skill_name = skill_name
        self.score = score
        self.confidence = confidence
        self.assessment_score = assessment_score
        self.github_commits = github_commits
        self.project_count = project_count
        self.verified_cert = verified_cert
        self.internship_exp = internship_exp
        self.evidence_summary = evidence_summary

    def to_dict(self) -> Dict[str, Any]:
        return {
            "skill_name": self.skill_name,
            "score": self.score,
            "confidence": self.confidence,
            "assessment_score": self.assessment_score,
            "github_commits": self.github_commits,
            "project_count": self.project_count,
            "verified_cert": self.verified_cert,
            "internship_exp": self.internship_exp,
            "evidence_summary": self.evidence_summary
        }

# --- Recruiter Schemas ---

class JobRequirement:
    def __init__(self, skill: str, min_score: float, is_required: bool = True, weight: float = 1.0):
        self.skill = skill
        self.min_score = min_score
        self.is_required = is_required
        self.weight = weight

    def to_dict(self) -> Dict[str, Any]:
        return {
            "skill": self.skill,
            "min_score": self.min_score,
            "is_required": self.is_required,
            "weight": self.weight
        }

class JobRequisition:
    def __init__(self, job_id: str, title: str, company: str, department: str,
                 min_experience_years: float, min_readiness_score: float,
                 requirements: List[JobRequirement], preferred_skills: List[str] = None,
                 description: str = "", is_active: bool = True, created_at: str = ""):
        self.job_id = job_id
        self.title = title
        self.company = company
        self.department = department
        self.min_experience_years = min_experience_years
        self.min_readiness_score = min_readiness_score
        self.requirements = requirements
        self.preferred_skills = preferred_skills or []
        self.description = description
        self.is_active = is_active
        self.created_at = created_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "title": self.title,
            "company": self.company,
            "department": self.department,
            "min_experience_years": self.min_experience_years,
            "min_readiness_score": self.min_readiness_score,
            "requirements": [r.to_dict() for r in self.requirements],
            "preferred_skills": self.preferred_skills,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at
        }

class CandidateRankResult:
    def __init__(self, student_id: str, candidate_alias: str, department: str, batch: str,
                 target_role: str, match_score: float, matched_skills: List[Dict[str, Any]],
                 missing_skills: List[Dict[str, Any]], explanation: str,
                 shortlist_status: str, consented_placement: bool,
                 confidence: str = "High", experience_months: int = 0):
        self.student_id = student_id
        self.candidate_alias = candidate_alias # Recruiter view protects student anonymity/privacy unless consented
        self.department = department
        self.batch = batch
        self.target_role = target_role
        self.match_score = match_score
        self.matched_skills = matched_skills
        self.missing_skills = missing_skills
        self.explanation = explanation
        self.shortlist_status = shortlist_status
        self.consented_placement = consented_placement
        self.confidence = confidence
        self.experience_months = experience_months

    def to_dict(self) -> Dict[str, Any]:
        return {
            "student_id": self.student_id,
            "candidate_alias": self.candidate_alias,
            "department": self.department,
            "batch": self.batch,
            "target_role": self.target_role,
            "match_score": round(self.match_score, 1),
            "matched_skills": self.matched_skills,
            "missing_skills": self.missing_skills,
            "explanation": self.explanation,
            "shortlist_status": self.shortlist_status,
            "consented_placement": self.consented_placement,
            "confidence": self.confidence,
            "experience_months": self.experience_months
        }
