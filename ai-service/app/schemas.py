"""
Pydantic schemas for FastAPI AI/ML microservice request and response validation.
Strict validation ensures minimal required data is received with no sensitive credentials.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    id: Optional[str] = None
    title: str
    type: str  # assessment, project, certificate, internship, coding_profile, achievement, resume
    source: Optional[str] = None
    verification_status: str = "unverified"  # verified, pending, unverified, rejected
    evidence_date: Optional[str] = None
    related_skills: List[str] = Field(default_factory=list)
    score: Optional[float] = None  # Assessment score if applicable (0-100)
    description: Optional[str] = None


class SkillScoreResult(BaseModel):
    skill_name: str
    score: Optional[float] = None  # 0-100 proficiency, or None if insufficient evidence
    confidence_score: float  # 0.0 - 1.0
    confidence_level: str  # High, Medium, Low
    supporting_evidence_count: int
    evidence_sources: List[str]
    last_updated: Optional[str] = None
    explanation: str
    limitations: str
    status: str  # "evaluated" | "insufficient_evidence"


class AnalyzeSkillsRequest(BaseModel):
    student_id: Optional[str] = None
    evidence_items: List[EvidenceItem]
    target_skills: Optional[List[str]] = None


class AnalyzeSkillsResponse(BaseModel):
    success: bool
    version: str = "v1.2-rule-based-deterministic"
    methodology: str = "Evidence-weighted multi-source proficiency & confidence model"
    skills: List[SkillScoreResult]
    evaluated_count: int
    insufficient_evidence_count: int


class RoleSkillRequirement(BaseModel):
    skill_name: str
    min_level: float = Field(..., ge=0, le=100, description="Minimum proficiency level required (0-100)")
    importance: str = "required"  # "required" | "preferred"
    category: Optional[str] = None


class RoleDefinitionInput(BaseModel):
    role_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    required_skills: List[RoleSkillRequirement]


class SkillGapItem(BaseModel):
    skill_name: str
    category: Optional[str] = "General"
    status: str  # "meeting", "weak", "insufficient_evidence", "missing"
    current_level: Optional[float] = None
    required_level: float
    importance: str
    confidence_level: str
    evidence_count: int
    gap_difference: float
    why_it_matters: str
    suggested_action: str


class SkillGapAnalysisRequest(BaseModel):
    student_id: Optional[str] = None
    target_role: RoleDefinitionInput
    student_skills: List[SkillScoreResult]


class SkillGapAnalysisResponse(BaseModel):
    success: bool
    role_title: str
    readiness_score: float  # 0 - 100
    readiness_band: str  # "High Readiness", "Moderate Readiness", "Developing", "Early Stage"
    total_required_skills: int
    skills_meeting_count: int
    skills_weak_count: int
    skills_insufficient_count: int
    skills_missing_count: int
    gaps: List[SkillGapItem]
    calculation_summary: str
    disclaimer: str


class RoleMatchRequest(BaseModel):
    student_skills: List[SkillScoreResult]
    available_roles: List[RoleDefinitionInput]


class RoleMatchItem(BaseModel):
    role_id: Optional[str] = None
    role_title: str
    match_percentage: float
    readiness_score: float
    matching_skills: List[str]
    missing_skills: List[str]
    weak_skills: List[str]
    reasons: List[str]


class RoleMatchResponse(BaseModel):
    success: bool
    recommendations: List[RoleMatchItem]


class LearningResourceInput(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    target_skills: List[str]
    source_name: str
    source_url: str
    difficulty: Optional[str] = "Intermediate"
    estimated_hours: Optional[float] = None


class RecommendationRequest(BaseModel):
    identified_gaps: List[SkillGapItem]
    available_resources: List[LearningResourceInput]
    limit: int = 6


class RecommendedResourceItem(BaseModel):
    resource_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    target_skill: str
    source_name: str
    source_url: str
    difficulty: Optional[str] = "Intermediate"
    estimated_hours: Optional[float] = None
    relevance_reason: str
    priority: str  # "High", "Medium", "Low"


class RecommendationResponse(BaseModel):
    success: bool
    recommended_resources: List[RecommendedResourceItem]


class ResumeExtractRequest(BaseModel):
    text_content: str


class ExtractedSkillItem(BaseModel):
    skill_name: str
    confidence: float
    matched_term: str
    category: str
    source_type: str = "resume_extraction"
    verification_status: str = "unverified"


class ResumeExtractResponse(BaseModel):
    success: bool
    extracted_skills: List[ExtractedSkillItem]
    total_extracted: int
    notice: str
