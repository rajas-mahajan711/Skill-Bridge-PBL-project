from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "skillbridge-ai"
    version: str = "1.0.0"
    mode: str = "live"

class SkillExtractionRequest(BaseModel):
    text: str = Field(..., description="Resume, project description, or assessment text")
    source: Optional[str] = Field("text", description="github | resume | leetcode | project")

class ExtractedSkill(BaseModel):
    name: str
    confidence: float
    evidence_snippet: Optional[str] = None

class SkillExtractionResponse(BaseModel):
    skills: List[ExtractedSkill]
    extracted_count: int

class RoleMatchRequest(BaseModel):
    student_skills: List[Dict[str, Any]]
    role_requirements: List[str]

class RoleMatchResponse(BaseModel):
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: List[str]
