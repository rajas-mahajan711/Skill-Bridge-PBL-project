"""
FastAPI Analysis and Recommendation API Routes
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas import (
    AnalyzeSkillsRequest,
    AnalyzeSkillsResponse,
    SkillGapAnalysisRequest,
    SkillGapAnalysisResponse,
    RoleMatchRequest,
    RoleMatchResponse,
    RecommendationRequest,
    RecommendationResponse,
    ResumeExtractRequest,
    ResumeExtractResponse,
)
from app.services.scoring_service import ScoringService
from app.services.skill_gap_service import SkillGapService
from app.services.role_matcher import RoleMatcher
from app.services.recommendation_service import RecommendationService
from app.services.extractor_service import ResumeExtractorService

router = APIRouter(prefix="", tags=["Skill Intelligence Analysis"])


@router.post("/analyze-skills", response_model=AnalyzeSkillsResponse)
async def analyze_skills(payload: AnalyzeSkillsRequest):
    """
    Analyzes submitted evidence items, returns evidence-backed scores and confidence metrics.
    """
    try:
        results = ScoringService.evaluate_skills(
            payload.evidence_items,
            payload.target_skills,
        )
        eval_count = sum(1 for r in results if r.status == "evaluated")
        insufficient_count = sum(1 for r in results if r.status == "insufficient_evidence")

        return AnalyzeSkillsResponse(
            success=True,
            skills=results,
            evaluated_count=eval_count,
            insufficient_evidence_count=insufficient_count,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error evaluating skills: {str(e)}",
        )


@router.post("/skill-gaps", response_model=SkillGapAnalysisResponse)
async def analyze_skill_gaps(payload: SkillGapAnalysisRequest):
    """
    Evaluates student evaluated skills against target career role requirements.
    Categorizes into Meeting, Weak, Insufficient Evidence, and Missing.
    """
    try:
        return SkillGapService.analyze_gaps(
            target_role=payload.target_role,
            student_skills=payload.student_skills,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing skill gaps: {str(e)}",
        )


@router.post("/match-role", response_model=RoleMatchResponse)
async def match_roles(payload: RoleMatchRequest):
    """
    Ranks available career roles based on student skill evidence.
    """
    try:
        return RoleMatcher.match_roles(
            student_skills=payload.student_skills,
            available_roles=payload.available_roles,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error matching career roles: {str(e)}",
        )


@router.post("/recommendations", response_model=RecommendationResponse)
async def recommend_learning_resources(payload: RecommendationRequest):
    """
    Recommends learning resources targeted at identified student skill gaps.
    """
    try:
        return RecommendationService.recommend_resources(
            identified_gaps=payload.identified_gaps,
            available_resources=payload.available_resources,
            limit=payload.limit,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating learning recommendations: {str(e)}",
        )


@router.post("/extract-skills", response_model=ResumeExtractResponse)
async def extract_skills_from_resume(payload: ResumeExtractRequest):
    """
    Parses resume text or professional bio to identify candidate technical skills.
    Explicitly flags extracted skills as unverified candidates.
    """
    try:
        return ResumeExtractorService.extract_skills(payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting resume skills: {str(e)}",
        )
