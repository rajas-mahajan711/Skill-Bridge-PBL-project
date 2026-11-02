"""
Tests for SkillBridge AI Service Phase 2 - Skill Scoring
"""
import pytest
from app.schemas.skill_schemas import (
    SkillEvidenceItem,
    SkillScoringRequest,
    ScoredSkill,
    SkillScoringResponse,
)
from app.core.scorer import (
    score_skills,
    validate_and_resolve_weights,
    DEFAULT_SOURCE_WEIGHTS,
)


def test_single_source_scoring_mathematical_precision():
    """
    Test single source scoring with exact mathematical verification:
    Skill: Docker
    Source: resume (weight = 0.15)
    confidence = 0.72, occurrences = 1
    freq_bonus = min(0.25, 0 * 0.05) = 0.0
    Q_resume = min(1.0, 0.72 * 1.0) = 0.72
    B_Docker = 100 * (0.15 * 0.72) / 0.15 = 72.0
    Multi-source bonus: 0.0 (1 source)
    final_score = min(100.0, round(72.0 * 0.90 + 0, 1)) = 64.8
    level = 'Intermediate' (60.0 <= 64.8 < 80.0)
    """
    items = [
        SkillEvidenceItem(
            skill_name="Docker",
            source="resume",
            confidence=0.72,
            evidence_snippet="Containerized backend microservices using Docker.",
            occurrences=1,
        )
    ]
    res = score_skills(items)
    assert res.scored_count == 1
    skill = res.skills[0]
    assert skill.skill_name == "Docker"
    assert skill.score == 64.8
    assert skill.level == "Intermediate"
    assert skill.confidence == 0.72
    assert skill.sources == ["resume"]
    assert skill.evidence_count == 1
    assert skill.breakdown["resume"] == 64.8
    assert skill.breakdown["corroboration_bonus"] == 0.0
    assert res.overall_score == 64.8
    assert res.readiness_tier == "in_progress"


def test_multi_source_corroboration_exact_calculation():
    """
    Test two-source corroboration with exact mathematical calculation:
    Skill: React
    Source 1: github (weight = 0.35), conf = 0.88, occurrences = 4
       freq_bonus = min(0.25, 3 * 0.05) = 0.15
       Q_github = min(1.0, 0.88 * 1.15) = min(1.0, 1.012) = 1.0
    Source 2: project (weight = 0.20), conf = 0.80, occurrences = 2
       freq_bonus = min(0.25, 1 * 0.05) = 0.05
       Q_project = min(1.0, 0.80 * 1.05) = 0.84
    Active weight sum: 0.35 + 0.20 = 0.55
    B_React = 100 * (0.35 * 1.0 + 0.20 * 0.84) / 0.55 = 100 * 0.518 / 0.55 = 94.1818...
    Scaled base (0.90): 94.1818... * 0.90 = 84.7636...
    Corroboration bonus for 2 sources: +5.0
    Final score: min(100.0, round(84.7636... + 5.0, 1)) = round(89.7636..., 1) = 89.8
    Level: 'Advanced' (89.8 >= 80.0)
    """
    items = [
        SkillEvidenceItem(
            skill_name="React",
            source="github",
            confidence=0.88,
            evidence_snippet="Built responsive UI using React 18.",
            occurrences=4,
        ),
        SkillEvidenceItem(
            skill_name="React",
            source="project",
            confidence=0.80,
            evidence_snippet="Course project developed with React.",
            occurrences=2,
        ),
    ]
    res = score_skills(items)
    assert res.scored_count == 1
    skill = res.skills[0]
    assert skill.skill_name == "React"
    assert skill.score == 89.8
    assert skill.level == "Advanced"
    assert skill.confidence == round((0.88 + 0.80) / 2, 2)  # 0.84
    assert set(skill.sources) == {"github", "project"}
    assert skill.evidence_count == 6
    assert skill.breakdown["github"] == 57.3
    assert skill.breakdown["project"] == 27.5
    assert skill.breakdown["corroboration_bonus"] == 5.0
    assert res.overall_score == 89.8
    assert res.readiness_tier == "ready"


def test_three_source_corroboration_maximum_bonus():
    """3 or more distinct sources yield a +10.0 corroboration bonus."""
    items = [
        SkillEvidenceItem(skill_name="Python", source="github", confidence=0.90, occurrences=2),
        SkillEvidenceItem(skill_name="Python", source="assessment", confidence=0.85, occurrences=1),
        SkillEvidenceItem(skill_name="Python", source="certificate", confidence=0.95, occurrences=1),
    ]
    res = score_skills(items)
    skill = res.skills[0]
    assert len(skill.sources) == 3
    assert skill.breakdown["corroboration_bonus"] == 10.0
    assert skill.score >= 80.0
    assert skill.level == "Advanced"


def test_frequency_bonus_and_cap():
    """Frequency bonus scales at +5% per extra occurrence up to a maximum cap of +25%."""
    # 1 occurrence: bonus = 0%
    item_1 = [SkillEvidenceItem(skill_name="SQL", source="github", confidence=0.70, occurrences=1)]
    score_1 = score_skills(item_1).skills[0].score

    # 3 occurrences: bonus = +10%
    item_3 = [SkillEvidenceItem(skill_name="SQL", source="github", confidence=0.70, occurrences=3)]
    score_3 = score_skills(item_3).skills[0].score
    assert score_3 > score_1

    # 6 occurrences: bonus = +25% (cap reached at 6)
    item_6 = [SkillEvidenceItem(skill_name="SQL", source="github", confidence=0.70, occurrences=6)]
    score_6 = score_skills(item_6).skills[0].score

    # 50 occurrences: bonus must still be capped at +25%
    item_50 = [SkillEvidenceItem(skill_name="SQL", source="github", confidence=0.70, occurrences=50)]
    score_50 = score_skills(item_50).skills[0].score

    # Both score_6 and score_50 should have identical frequency bonus due to the cap
    assert score_6 == score_50


def test_confidence_aggregation_source_balanced():
    """
    Test that confidence aggregation averages source-level confidences,
    preventing 10 items from one source from drowning out another source.
    """
    items = [
        # Source 1: 5 items from resume with confidence 0.60 -> average = 0.60
        SkillEvidenceItem(skill_name="Java", source="resume", confidence=0.60),
        SkillEvidenceItem(skill_name="Java", source="resume", confidence=0.60),
        SkillEvidenceItem(skill_name="Java", source="resume", confidence=0.60),
        SkillEvidenceItem(skill_name="Java", source="resume", confidence=0.60),
        SkillEvidenceItem(skill_name="Java", source="resume", confidence=0.60),
        # Source 2: 1 item from assessment with confidence 1.00 -> average = 1.00
        SkillEvidenceItem(skill_name="Java", source="assessment", confidence=1.00),
    ]
    res = score_skills(items)
    skill = res.skills[0]
    # Source-balanced confidence: (0.60 + 1.00) / 2 = 0.80
    # NOT unweighted average: (5*0.6 + 1.0)/6 = 0.67
    assert skill.confidence == 0.80


def test_custom_source_weights_and_fallback():
    """Test custom source weights override, with fallback for unmentioned recognized sources."""
    # Custom weights override github and leetcode
    custom = {"github": 0.50, "leetcode": 0.50}
    resolved = validate_and_resolve_weights(custom)
    assert resolved["github"] == 0.50
    assert resolved["leetcode"] == 0.50
    # Other recognized sources fall back to defaults
    assert resolved["assessment"] == DEFAULT_SOURCE_WEIGHTS["assessment"]
    assert resolved["resume"] == DEFAULT_SOURCE_WEIGHTS["resume"]


def test_invalid_weights_rejected():
    """Negative weights, unknown sources, and all-zero weights must raise ValueError."""
    # 1. Negative weight
    with pytest.raises(ValueError, match="Negative weight"):
        validate_and_resolve_weights({"github": -0.10})

    # 2. Unknown source name
    with pytest.raises(ValueError, match="Unknown source 'blockchain_repo'"):
        validate_and_resolve_weights({"blockchain_repo": 0.40})

    # 3. All zero weights
    zero_weights = {k: 0.0 for k in DEFAULT_SOURCE_WEIGHTS.keys()}
    with pytest.raises(ValueError, match="All source weights cannot be zero"):
        validate_and_resolve_weights(zero_weights)


def test_unknown_source_in_evidence_item_rejected():
    """Evidence item with an unknown source name must raise ValueError."""
    items = [SkillEvidenceItem(skill_name="C++", source="invalid_source", confidence=0.8)]
    with pytest.raises(ValueError, match="Unknown evidence source 'invalid_source'"):
        score_skills(items)


def test_empty_evidence_handling():
    """Empty evidence items must return an empty response with 0.0 score and needs_support tier."""
    res = score_skills([])
    assert res.scored_count == 0
    assert res.skills == []
    assert res.overall_score == 0.0
    assert res.readiness_tier == "needs_support"


def test_overall_readiness_tiers_and_skill_levels():
    """Test arithmetic mean of overall score and readiness tier mapping."""
    # Student with 1 Advanced skill (score = 89.8) and 1 Intermediate skill (score = 64.8)
    items = [
        # React (89.8)
        SkillEvidenceItem(skill_name="React", source="github", confidence=0.88, occurrences=4),
        SkillEvidenceItem(skill_name="React", source="project", confidence=0.80, occurrences=2),
        # Docker (64.8)
        SkillEvidenceItem(skill_name="Docker", source="resume", confidence=0.72, occurrences=1),
    ]
    res = score_skills(items)
    assert res.scored_count == 2
    # overall_score = round((89.8 + 64.8) / 2, 1) = round(77.3, 1) = 77.3
    assert res.overall_score == 77.3
    assert res.readiness_tier == "in_progress"

    # Levels
    levels = {s.skill_name: s.level for s in res.skills}
    assert levels["React"] == "Advanced"
    assert levels["Docker"] == "Intermediate"


# ── FastAPI Endpoint Integration Test ───────────────────────────────────────

def test_fastapi_score_endpoint():
    """Test POST /api/v1/skills/score via TestClient."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Valid scoring payload
    payload = {
        "evidence_items": [
            {
                "skill_name": "Python",
                "source": "github",
                "confidence": 0.90,
                "evidence_snippet": "Implemented asynchronous FastAPI microservice.",
                "occurrences": 3,
            },
            {
                "skill_name": "Python",
                "source": "assessment",
                "confidence": 0.85,
                "evidence_snippet": "Lab exam 2: OOP & Data Structures (Grade A)",
                "occurrences": 1,
            },
            {
                "skill_name": "MongoDB",
                "source": "project",
                "confidence": 0.75,
                "evidence_snippet": "Used MongoDB with Mongoose ODM.",
                "occurrences": 2,
            },
        ],
        "source_weights": {
            "github": 0.40,
            "assessment": 0.30,
            "project": 0.20,
        },
    }

    res = client.post("/api/v1/skills/score", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["scored_count"] == 2
    assert "skills" in data
    assert "overall_score" in data
    assert "readiness_tier" in data

    skill_names = [s["skill_name"] for s in data["skills"]]
    assert "Python" in skill_names
    assert "MongoDB" in skill_names

    py_skill = next(s for s in data["skills"] if s["skill_name"] == "Python")
    assert py_skill["score"] >= 80.0
    assert py_skill["level"] == "Advanced"
    assert "corroboration_bonus" in py_skill["breakdown"]
    assert py_skill["breakdown"]["corroboration_bonus"] == 5.0  # 2 sources

    # 2. Invalid weight payload (negative weight -> 400 Bad Request)
    bad_payload = {
        "evidence_items": [
            {"skill_name": "Python", "source": "github", "confidence": 0.8}
        ],
        "source_weights": {"github": -0.50},
    }
    bad_res = client.post("/api/v1/skills/score", json=bad_payload)
    assert bad_res.status_code == 400
    assert "Negative weight" in bad_res.json()["detail"]

    # 3. Invalid source name in evidence item -> 400 Bad Request
    bad_src_payload = {
        "evidence_items": [
            {"skill_name": "Python", "source": "unsupported_src", "confidence": 0.8}
        ]
    }
    bad_src_res = client.post("/api/v1/skills/score", json=bad_src_payload)
    assert bad_src_res.status_code == 400
    assert "Unknown evidence source" in bad_src_res.json()["detail"]

