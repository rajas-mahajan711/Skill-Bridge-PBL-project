"""
SkillBridge AI Service — Skills API Router
==========================================
Handles endpoints for skill intelligence:

  POST /api/v1/skills/extract
      Accepts JSON body { "text": "...", "source": "..." }.
      Returns extracted skills using the existing SkillExtractionResponse schema.
      This is the primary contract endpoint — format is preserved exactly.

  POST /api/v1/skills/extract/file   (extension — does NOT replace the above)
      Accepts a multipart file upload (PDF or DOCX).
      Extracts text from the file, then calls the same extraction engine.
      Returns the same SkillExtractionResponse schema.
      The source defaults to "resume" for file uploads.

  POST /api/v1/skills/score          (Phase 2 — Skill Scoring)
      Accepts a list of evidence items and optional source weights.
      Calculates deterministic, multi-source proficiency scores (0-100),
      skill levels, confidence, and overall placement readiness tier.

  POST /api/v1/matches/rank          (Phase 3 — Job Role Matching)
      Compares a student's skills profile against job-role requirements.
      Calculates deterministic match score based on 40% coverage and 60% proficiency.

  GET /api/v1/roles                  (Phase 3 — Role Catalog)
      Returns curated benchmark roles and their canonical skill requirements.

  POST /api/v1/gaps/analyze          (Phase 4 — Gap Analysis)
      Analyzes skill gaps against job-role requirements, prioritizes missing/deficit skills,
      and returns deterministic learning actions and effort planning estimates.
"""

import io
from fastapi import APIRouter, HTTPException, UploadFile, File, status

from app.schemas.skill_schemas import (
    SkillExtractionRequest,
    SkillExtractionResponse,
    ExtractedSkill,
    SkillScoringRequest,
    SkillScoringResponse,
    RoleMatchRequest,
    RoleMatchResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
)
from app.core.extractor import extract_skills
from app.core.scorer import score_skills
from app.core.matcher import match_role
from app.core.roles import get_benchmark_roles
from app.core.gap_analyzer import analyze_gaps


router = APIRouter()


# ── Helper: read text from an uploaded file ────────────────────────────────

def _extract_text_from_pdf(content: bytes) -> str:
    """Extract plain text from a PDF file using pdfplumber."""
    try:
        import pdfplumber
        text_parts: list[str] = []
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
        return "\n".join(text_parts)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read PDF file: {exc}",
        )


def _extract_text_from_docx(content: bytes) -> str:
    """Extract plain text from a DOCX file using python-docx."""
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        return "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Could not read DOCX file: {exc}",
        )


def _build_response(results, text_length: int) -> SkillExtractionResponse:
    """Convert internal ExtractedSkillResult list to the Pydantic response model."""
    skills = [
        ExtractedSkill(
            name             = r.name,
            confidence       = r.confidence,
            evidence_snippet = r.evidence_snippet or None,
        )
        for r in results
    ]
    return SkillExtractionResponse(
        skills          = skills,
        extracted_count = len(skills),
    )


# ── Endpoint 1: JSON text extraction (existing contract — preserved exactly) ─

@router.post(
    "/api/v1/skills/extract",
    response_model=SkillExtractionResponse,
    summary="Extract skills from evidence text",
    description=(
        "Accepts a JSON body with `text` (evidence text) and optional `source` "
        "(resume | github | leetcode | project | text). "
        "Returns only skills genuinely detected in the supplied text."
    ),
)
def extract_skills_from_text(payload: SkillExtractionRequest) -> SkillExtractionResponse:
    """
    Primary skill extraction endpoint.
    Contract defined in docs/API_CONTRACTS.md — format must not change.
    """
    results = extract_skills(text=payload.text, source=payload.source)
    return _build_response(results, len(payload.text))


# ── Endpoint 2: File upload extension (separate from the JSON contract) ──────

@router.post(
    "/api/v1/skills/extract/file",
    response_model=SkillExtractionResponse,
    summary="Extract skills from an uploaded resume file (PDF or DOCX)",
    description=(
        "Extension endpoint — does NOT replace the JSON extraction endpoint. "
        "Accepts a multipart file upload (.pdf or .docx). "
        "Extracts text from the file and returns detected skills. "
        "Returns the same SkillExtractionResponse schema."
    ),
)
async def extract_skills_from_file(
    file: UploadFile = File(..., description="Resume file — .pdf or .docx"),
) -> SkillExtractionResponse:
    """
    File-upload extension.
    Same response schema as the JSON endpoint; source is fixed to 'resume'.
    """
    filename = (file.filename or "").lower()
    content  = await file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    if filename.endswith(".pdf"):
        text = _extract_text_from_pdf(content)
    elif filename.endswith(".docx"):
        text = _extract_text_from_docx(content)
    else:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only .pdf and .docx files are supported.",
        )

    results = extract_skills(text=text, source="resume")
    return _build_response(results, len(text))


# ── Endpoint 3: Skill Scoring (Phase 2) ─────────────────────────────────────

@router.post(
    "/api/v1/skills/score",
    response_model=SkillScoringResponse,
    summary="Calculate evidence-backed skill proficiency scores",
    description=(
        "Accepts a list of evidence items across verifiable sources (github, leetcode, "
        "assessment, certificate, project, resume, text) and calculates deterministic proficiency scores (0-100), "
        "levels (Beginner, Intermediate, Advanced), confidence, and overall readiness tier."
    ),
)
def compute_skill_scores(payload: SkillScoringRequest) -> SkillScoringResponse:
    """
    Skill scoring endpoint according to docs/API_CONTRACTS.md.
    """
    try:
        return score_skills(
            evidence_items=payload.evidence_items,
            source_weights=payload.source_weights,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )


# ── Endpoint 4: Job Role Matching (Phase 3) ─────────────────────────────────

@router.post(
    "/api/v1/matches/rank",
    response_model=RoleMatchResponse,
    summary="Match student skills against job role requirements",
    description=(
        "Compares a student's skills profile against job-role requirements. "
        "Calculates a deterministic match score based on 40% requirement coverage and 60% proficiency, "
        "and returns matched skills, missing skills, and a transparent explanation breakdown."
    ),
)
def rank_role_match(payload: RoleMatchRequest) -> RoleMatchResponse:
    """
    Job role matching endpoint according to docs/API_CONTRACTS.md.
    """
    try:
        return match_role(
            student_skills=payload.student_skills,
            role_requirements=payload.role_requirements,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err),
        )


# ── Endpoint 5: Benchmark Role Catalog (Phase 3) ────────────────────────────

@router.get(
    "/api/v1/roles",
    summary="List standard benchmark college placement roles",
    description="Returns curated benchmark roles and their canonical skill requirements.",
)
def list_benchmark_roles():
    """
    Benchmark role catalog lookup.
    """
    return {
        "success": True,
        "roles": get_benchmark_roles(),
    }


# ── Endpoint 6: Skill Gap Analysis (Phase 4) ────────────────────────────────

@router.post(
    "/api/v1/gaps/analyze",
    response_model=GapAnalysisResponse,
    summary="Analyze candidate skill gaps against role requirements",
    description=(
        "Compares student skills against target role requirements and a target proficiency threshold "
        "(default 80.0). Calculates individual skill gaps, categorizes status ('MISSING' vs 'NEEDS_IMPROVEMENT'), "
        "assigns deterministic priorities ('HIGH', 'MEDIUM', 'LOW'), and provides actionable learning project "
        "recommendations and rough planning effort estimates."
    ),
)
def analyze_skill_gaps(payload: GapAnalysisRequest) -> GapAnalysisResponse:
    """
    Skill gap analysis endpoint according to docs/API_CONTRACTS.md.
    """
    try:
        return analyze_gaps(
            student_skills=payload.student_skills,
            role_requirements=payload.role_requirements,
            target_proficiency=payload.target_proficiency,
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(err),
        )

