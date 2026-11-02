"""
SkillBridge AI Service — Skill Gap Analysis Engine Tests (Phase 4)
===================================================================
Tests for gap identification, deterministic prioritization, learning action
generation, effort estimation, and API endpoint integration.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.gap_analyzer import (
    analyze_gaps,
    _get_learning_action,
)
from app.schemas.skill_schemas import (
    GapAnalysisRequest,
    GapAnalysisResponse,
)

client = TestClient(app)


# ── 1. Worked Example Verification ──────────────────────────────────────────

def test_worked_gap_example():
    """
    Verifies the exact numerical worked example:
      Target Proficiency: 80.0
      Candidate: Python (85.0), FastAPI (75.0), PostgreSQL (50.0)
      Requirements: Python, FastAPI, PostgreSQL, Docker

    Calculations:
      - Python: 85.0 >= 80.0 -> Gap 0.0 (Omitted)
      - Docker: 0.0 -> Gap 80.0, MISSING, HIGH priority
      - PostgreSQL: 50.0 -> Gap 30.0, NEEDS_IMPROVEMENT, MEDIUM priority (20 <= 30 < 40)
      - FastAPI: 75.0 -> Gap 5.0, NEEDS_IMPROVEMENT, LOW priority (0 < 5 < 20)

    Ordering:
      1. Docker (HIGH, gap 80.0)
      2. PostgreSQL (MEDIUM, gap 30.0)
      3. FastAPI (LOW, gap 5.0)

    Effort:
      1 missing (2 wks) + 2 deficits (2 wks) = 4 weeks rough planning estimate.
    """
    student_skills = [
        {"skill_name": "Python", "score": 85.0},
        {"skill_name": "FastAPI", "score": 75.0},
        {"skill_name": "PostgreSQL", "score": 50.0},
    ]
    role_requirements = ["Python", "FastAPI", "PostgreSQL", "Docker"]

    response: GapAnalysisResponse = analyze_gaps(
        student_skills=student_skills,
        role_requirements=role_requirements,
        target_proficiency=80.0,
    )

    assert response.total_gaps == 3
    assert response.critical_gaps_count == 1
    assert response.target_proficiency == 80.0
    assert response.estimated_effort_weeks == 4

    gaps = response.gaps
    assert len(gaps) == 3

    # Rank 1: Docker
    assert gaps[0].skill_name == "Docker"
    assert gaps[0].priority == "HIGH"
    assert gaps[0].status == "MISSING"
    assert gaps[0].current_score == 0.0
    assert gaps[0].proficiency_gap == 80.0

    # Rank 2: PostgreSQL
    assert gaps[1].skill_name == "PostgreSQL"
    assert gaps[1].priority == "MEDIUM"
    assert gaps[1].status == "NEEDS_IMPROVEMENT"
    assert gaps[1].current_score == 50.0
    assert gaps[1].proficiency_gap == 30.0

    # Rank 3: FastAPI
    assert gaps[2].skill_name == "FastAPI"
    assert gaps[2].priority == "LOW"
    assert gaps[2].status == "NEEDS_IMPROVEMENT"
    assert gaps[2].current_score == 75.0
    assert gaps[2].proficiency_gap == 5.0

    assert "3 skill gaps" in response.summary
    assert "4 weeks" in response.summary


# ── 2. Boundary and Edge Cases ──────────────────────────────────────────────

def test_zero_gaps_when_all_skills_meet_or_exceed_target():
    """When a student meets or exceeds target proficiency on all requirements, gaps list is empty."""
    student_skills = [
        {"skill_name": "Python", "score": 80.0},
        {"skill_name": "Docker", "score": 92.5},
        {"skill_name": "PostgreSQL", "score": 85.0},
    ]
    role_requirements = ["Python", "Docker", "PostgreSQL"]

    response = analyze_gaps(student_skills, role_requirements, target_proficiency=80.0)

    assert response.total_gaps == 0
    assert response.critical_gaps_count == 0
    assert response.estimated_effort_weeks == 0
    assert len(response.gaps) == 0
    assert "No skill gaps identified" in response.summary


def test_all_missing_skills():
    """When candidate has no matching skills, all requirements are marked MISSING and HIGH priority."""
    student_skills = []
    role_requirements = ["React", "TypeScript", "Node.js"]

    response = analyze_gaps(student_skills, role_requirements, target_proficiency=80.0)

    assert response.total_gaps == 3
    assert response.critical_gaps_count == 3
    assert response.estimated_effort_weeks == 6  # 3 * 2 weeks
    for gap in response.gaps:
        assert gap.status == "MISSING"
        assert gap.priority == "HIGH"
        assert gap.current_score == 0.0
        assert gap.proficiency_gap == 80.0


def test_priority_threshold_boundaries():
    """
    Test exact boundary values:
      Gr >= 40.0         -> HIGH
      20.0 <= Gr < 40.0  -> MEDIUM
      0.0 < Gr < 20.0    -> LOW
    """
    target = 80.0
    student_skills = [
        {"skill_name": "Java", "score": 40.0},        # Gap = 40.0 -> HIGH
        {"skill_name": "Python", "score": 40.1},      # Gap = 39.9 -> MEDIUM
        {"skill_name": "PostgreSQL", "score": 60.0},  # Gap = 20.0 -> MEDIUM
        {"skill_name": "Docker", "score": 60.1},      # Gap = 19.9 -> LOW
    ]
    role_requirements = ["Java", "Python", "PostgreSQL", "Docker"]

    response = analyze_gaps(student_skills, role_requirements, target_proficiency=target)

    gap_dict = {g.skill_name: g for g in response.gaps}

    assert gap_dict["Java"].proficiency_gap == 40.0
    assert gap_dict["Java"].priority == "HIGH"

    assert gap_dict["Python"].proficiency_gap == 39.9
    assert gap_dict["Python"].priority == "MEDIUM"

    assert gap_dict["PostgreSQL"].proficiency_gap == 20.0
    assert gap_dict["PostgreSQL"].priority == "MEDIUM"

    assert gap_dict["Docker"].proficiency_gap == 19.9
    assert gap_dict["Docker"].priority == "LOW"


def test_confidence_conversion_and_duplicate_handling():
    """Confidence (0.0-1.0) is converted to proficiency (0-100), and highest score wins on duplicate entries."""
    student_skills = [
        {"skill_name": "Docker", "confidence": 0.50},  # 50.0
        {"skill_name": "docker", "score": 70.0},       # 70.0 (overrides 50.0)
    ]
    role_requirements = ["Docker"]

    response = analyze_gaps(student_skills, role_requirements, target_proficiency=80.0)
    assert response.total_gaps == 1
    assert response.gaps[0].current_score == 70.0
    assert response.gaps[0].proficiency_gap == 10.0
    assert response.gaps[0].priority == "LOW"


# ── 3. Unknown Taxonomy Skills & Action Templates ───────────────────────────

def test_unknown_skill_in_requirements():
    """
    Unknown skills (not in taxonomy) preserve their raw name and receive
    a generic practical project recommendation without crashing.
    """
    student_skills = [{"skill_name": "Rust", "score": 50.0}]
    role_requirements = ["Rust", "CustomFrameworkXYZ"]

    response = analyze_gaps(student_skills, role_requirements, target_proficiency=80.0)

    gap_names = [g.skill_name for g in response.gaps]
    assert "CustomFrameworkXYZ" in gap_names
    assert "Rust" in gap_names

    xyz_gap = next(g for g in response.gaps if g.skill_name == "CustomFrameworkXYZ")
    assert xyz_gap.status == "MISSING"
    assert "CustomFrameworkXYZ" in xyz_gap.learning_action
    assert "GitHub" in xyz_gap.learning_action


def test_no_external_commercial_urls():
    """Ensures no learning actions contain external courses or commercial domains."""
    forbidden_terms = ["coursera", "udemy", "edx", "pluralsight", "http://", "https://", "www."]

    for status in ["MISSING", "NEEDS_IMPROVEMENT"]:
        for skill in ["Python", "React", "Docker", "SQL", "Machine Learning", "ArbitrarySkill"]:
            action = _get_learning_action(skill, status)
            lower_action = action.lower()
            for term in forbidden_terms:
                assert term not in lower_action, f"Forbidden term '{term}' found in action: {action}"


# ── 4. Input Validation & Error Handling ────────────────────────────────────

def test_empty_role_requirements_raises_value_error():
    """Empty requirements list raises ValueError."""
    with pytest.raises(ValueError, match="role_requirements cannot be empty"):
        analyze_gaps([], [])


def test_invalid_target_proficiency_raises_value_error():
    """Target proficiency outside 50-100 raises ValueError."""
    with pytest.raises(ValueError, match="target_proficiency must be between 50.0 and 100.0"):
        analyze_gaps([], ["Python"], target_proficiency=40.0)

    with pytest.raises(ValueError, match="target_proficiency must be between 50.0 and 100.0"):
        analyze_gaps([], ["Python"], target_proficiency=110.0)


def test_invalid_student_skill_score_raises_value_error():
    """Skill score outside 0-100 raises ValueError."""
    with pytest.raises(ValueError, match="Skill score for 'Python' must be between 0.0 and 100.0"):
        analyze_gaps([{"skill_name": "Python", "score": 105.0}], ["Python"])


def test_missing_both_score_and_confidence_raises_value_error():
    """Skill with neither score nor confidence raises ValueError."""
    with pytest.raises(ValueError, match="must provide either a 'score'"):
        analyze_gaps([{"skill_name": "Python"}], ["Python"])


# ── 5. FastAPI Endpoint Integration Tests ───────────────────────────────────

def test_fastapi_gaps_analyze_endpoint_success():
    """Tests POST /api/v1/gaps/analyze over HTTP with FastAPI TestClient."""
    payload = {
        "student_skills": [
            {"skill_name": "Python", "score": 85.0},
            {"skill_name": "FastAPI", "score": 75.0},
            {"skill_name": "PostgreSQL", "score": 50.0},
        ],
        "role_requirements": ["Python", "FastAPI", "PostgreSQL", "Docker"],
        "target_proficiency": 80.0,
    }

    resp = client.post("/api/v1/gaps/analyze", json=payload)
    assert resp.status_code == 200

    data = resp.json()
    assert data["total_gaps"] == 3
    assert data["critical_gaps_count"] == 1
    assert data["target_proficiency"] == 80.0
    assert data["estimated_effort_weeks"] == 4
    assert len(data["gaps"]) == 3
    assert data["gaps"][0]["skill_name"] == "Docker"
    assert data["gaps"][0]["priority"] == "HIGH"


def test_fastapi_gaps_analyze_endpoint_validation_error():
    """Tests POST /api/v1/gaps/analyze returns HTTP 422 on invalid input."""
    # Invalid target proficiency (under 50)
    bad_payload = {
        "student_skills": [{"skill_name": "Python", "score": 80.0}],
        "role_requirements": ["Python"],
        "target_proficiency": 30.0,
    }
    resp = client.post("/api/v1/gaps/analyze", json=bad_payload)
    assert resp.status_code == 422

    # Empty role requirements
    bad_payload_2 = {
        "student_skills": [{"skill_name": "Python", "score": 80.0}],
        "role_requirements": [],
    }
    resp2 = client.post("/api/v1/gaps/analyze", json=bad_payload_2)
    assert resp2.status_code == 422

