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

# ── Phase 2: Skill Scoring Schemas ──────────────────────────────────────────

class SkillEvidenceItem(BaseModel):
    skill_name: str = Field(..., min_length=1, description="Name of the skill")
    source: str = Field("text", description="github | leetcode | assessment | certificate | resume | project | text")
    confidence: float = Field(0.7, ge=0.0, le=1.0, description="Heuristic detection confidence (0.0 to 1.0)")
    evidence_snippet: Optional[str] = Field(None, description="Verbatim quote or proof snippet")
    occurrences: int = Field(1, ge=1, description="Number of times evidenced in this source (min: 1)")

class SkillScoringRequest(BaseModel):
    evidence_items: List[SkillEvidenceItem] = Field(default_factory=list, description="List of evidence items across sources")
    source_weights: Optional[Dict[str, float]] = Field(None, description="Optional custom source weights dictionary")

class ScoredSkill(BaseModel):
    skill_name: str
    score: float = Field(..., ge=0.0, le=100.0, description="Computed proficiency score (0.0 to 100.0)")
    level: str = Field(..., description="Beginner (<60) | Intermediate (60-79.9) | Advanced (>=80)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Source-balanced confidence average")
    sources: List[str] = Field(..., description="Distinct verified evidence sources")
    evidence_count: int = Field(..., ge=0, description="Total occurrences across all sources")
    evidence_snippets: List[str] = Field(default_factory=list, description="Evidence snippets from all sources")
    breakdown: Dict[str, float] = Field(..., description="Point contribution breakdown per source and corroboration bonus")

class SkillScoringResponse(BaseModel):
    skills: List[ScoredSkill] = Field(..., description="List of evaluated skills")
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Arithmetic mean of all skill scores")
    readiness_tier: str = Field(..., description="ready (>=80) | in_progress (60-79.9) | needs_support (<60)")
    scored_count: int = Field(..., ge=0, description="Total number of scored skills")

# ── Phase 4: Skill Gap Analysis Schemas ─────────────────────────────────────

class SkillGapItem(BaseModel):
    skill_name: str = Field(..., description="Canonical or requested skill name")
    priority: str = Field(..., description="HIGH | MEDIUM | LOW")
    status: str = Field(..., description="MISSING | NEEDS_IMPROVEMENT")
    current_score: float = Field(..., ge=0.0, le=100.0, description="Current proficiency score (0.0 if missing)")
    target_score: float = Field(..., ge=50.0, le=100.0, description="Target proficiency threshold (default 80.0)")
    proficiency_gap: float = Field(..., ge=0.0, le=100.0, description="Deficit points needed to reach target threshold")
    learning_action: str = Field(..., description="Deterministic, practical project or study recommendation")

class GapAnalysisRequest(BaseModel):
    student_skills: List[Dict[str, Any]] = Field(default_factory=list, description="Student's extracted or scored skills")
    role_requirements: List[str] = Field(..., description="List of required skills for the target role")
    target_proficiency: float = Field(80.0, ge=50.0, le=100.0, description="Target proficiency score (50.0 - 100.0, default: 80.0)")

class GapAnalysisResponse(BaseModel):
    gaps: List[SkillGapItem] = Field(..., description="Prioritized list of skill gaps")
    total_gaps: int = Field(..., ge=0, description="Total count of skill gaps identified")
    critical_gaps_count: int = Field(..., ge=0, description="Count of HIGH priority gaps")
    target_proficiency: float = Field(..., description="Benchmark target proficiency threshold applied")
    estimated_effort_weeks: int = Field(..., ge=0, description="Rough planning estimate (2 wks/missing, 1 wk/deficit)")
    summary: str = Field(..., description="Executive summary of the candidate's gap profile")

