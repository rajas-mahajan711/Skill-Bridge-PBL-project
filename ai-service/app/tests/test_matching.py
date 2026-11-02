"""
Tests for SkillBridge AI Service Phase 3 - Job Role Matching
"""
import pytest
from app.core.matcher import match_role
from app.core.roles import (
    get_benchmark_roles,
    get_benchmark_role_skills,
    BENCHMARK_ROLES,
)
from app.schemas.skill_schemas import RoleMatchResponse


def test_worked_numerical_example():
    """
    Exact verification of the worked numerical example:
    Requirements: ["Python", "FastAPI", "PostgreSQL", "Docker"]  (N = 4)
    Student skills:
      - Python: 85.0
      - FastAPI: 75.0
      - PostgreSQL: 70.0
      - Git: 80.0 (surplus, not required)
    
    Calculation:
      Matched: 3 (Python, FastAPI, PostgreSQL)
      Missing: 1 (Docker)
      Coverage: 3 / 4 = 0.75
      Weighted proficiency: (85 + 75 + 70) / (4 * 100.0) = 230 / 400 = 0.575
      Raw score: 100.0 * (0.40 * 0.75 + 0.60 * 0.575)
               = 100.0 * (0.300 + 0.345) = 64.5
      Match score: 64.5%
    """
    student_skills = [
        {"skill_name": "Python", "score": 85.0, "level": "Advanced"},
        {"skill_name": "FastAPI", "score": 75.0, "level": "Intermediate"},
        {"skill_name": "PostgreSQL", "score": 70.0, "level": "Intermediate"},
        {"skill_name": "Git", "score": 80.0, "level": "Advanced"},
    ]
    role_requirements = ["Python", "FastAPI", "PostgreSQL", "Docker"]

    res = match_role(student_skills, role_requirements)

    assert isinstance(res, RoleMatchResponse)
    assert res.match_score == 64.5
    assert res.matched_skills == ["FastAPI", "PostgreSQL", "Python"]
    assert res.missing_skills == ["Docker"]
    assert len(res.explanation) >= 5
    assert "75.0% requirement coverage" in res.explanation[0]
    assert "64.5%" in res.explanation[-1]


def test_perfect_role_match():
    """Candidate with 100% scores on all required skills achieves 100.0 match."""
    reqs = ["React", "JavaScript", "HTML"]
    student = [
        {"name": "React", "score": 100.0},
        {"name": "JavaScript", "score": 100.0},
        {"name": "HTML", "score": 100.0},
    ]
    res = match_role(student, reqs)
    assert res.match_score == 100.0
    assert len(res.matched_skills) == 3
    assert len(res.missing_skills) == 0


def test_zero_role_match():
    """Candidate with completely disjoint skills achieves 0.0 match score."""
    reqs = ["Python", "FastAPI"]
    student = [
        {"name": "Swift", "score": 90.0},
        {"name": "Kotlin", "score": 95.0},
    ]
    res = match_role(student, reqs)
    assert res.match_score == 0.0
    assert res.matched_skills == []
    assert res.missing_skills == ["FastAPI", "Python"]


def test_empty_student_skills():
    """Empty student skills produces 0.0 score with all skills marked missing."""
    reqs = ["Docker", "Linux"]
    res = match_role([], reqs)
    assert res.match_score == 0.0
    assert res.matched_skills == []
    assert res.missing_skills == ["Docker", "Linux"]


def test_empty_role_requirements_raises_error():
    """Empty or blank role_requirements raises ValueError."""
    with pytest.raises(ValueError, match="role_requirements cannot be empty"):
        match_role([{"name": "Python", "score": 80.0}], [])

    with pytest.raises(ValueError, match="at least one valid, non-empty"):
        match_role([{"name": "Python", "score": 80.0}], ["   ", ""])


def test_duplicate_role_requirements_deduplication():
    """Duplicate requirements are deduplicated so the denominator N is correct."""
    reqs = ["Docker", "docker", "DOCKER"]
    student = [{"name": "Docker", "score": 80.0}]
    res = match_role(student, reqs)
    # N should be 1, not 3
    assert res.matched_skills == ["Docker"]
    assert res.missing_skills == []
    # Coverage = 1/1 = 1.0, Prof = 80/100 = 0.8
    # Score = 100 * (0.4*1.0 + 0.6*0.8) = 100 * (0.4 + 0.48) = 88.0
    assert res.match_score == 88.0


def test_duplicate_student_skills_takes_highest_score():
    """If candidate provides duplicate skill entries, the highest score is retained."""
    reqs = ["Python"]
    student = [
        {"name": "Python", "score": 60.0},
        {"name": "python", "score": 90.0},
    ]
    res = match_role(student, reqs)
    # With score 90.0: Coverage = 1.0, Prof = 0.90 -> 100 * (0.4 + 0.54) = 94.0
    assert res.match_score == 94.0


def test_scores_outside_0_to_100_rejected():
    """Scores < 0 or > 100 must be rejected with ValueError, not clamped."""
    with pytest.raises(ValueError, match="between 0.0 and 100.0"):
        match_role([{"name": "Python", "score": -5.0}], ["Python"])

    with pytest.raises(ValueError, match="between 0.0 and 100.0"):
        match_role([{"name": "Python", "score": 105.0}], ["Python"])


def test_confidence_converted_to_score():
    """Confidence (0.0 to 1.0) is converted to score * 100."""
    student = [{"name": "React", "confidence": 0.85}]
    res = match_role(student, ["React"])
    # 0.85 * 100 = 85.0. Coverage = 1.0, Prof = 0.85 -> 100 * (0.4 + 0.51) = 91.0
    assert res.match_score == 91.0


def test_missing_both_score_and_confidence_rejected():
    """Student skills without either score or confidence must be rejected with ValueError."""
    with pytest.raises(ValueError, match="must provide either a 'score'"):
        match_role([{"name": "React"}], ["React"])


def test_missing_skill_name_rejected():
    """Student skill entry without skill_name or name must be rejected."""
    with pytest.raises(ValueError, match="must provide a non-empty 'skill_name' or 'name'"):
        match_role([{"score": 85.0}], ["React"])


def test_only_existing_taxonomy_aliases_used():
    """Taxonomy alias resolution works only with existing defined aliases (e.g. 'postgres' -> 'PostgreSQL')."""
    student = [{"name": "postgres", "score": 80.0}]
    res = match_role(student, ["PostgreSQL"])
    assert res.matched_skills == ["PostgreSQL"]
    assert res.missing_skills == []


def test_benchmark_roles_catalog():
    """Benchmark roles catalog integrity and retrieval."""
    roles = get_benchmark_roles()
    assert "Frontend Developer" in roles
    assert "Backend Developer" in roles
    assert "Full Stack Developer" in roles
    assert "Data Scientist / ML Engineer" in roles
    assert "DevOps Engineer" in roles

    # Specific role query
    backend_skills = get_benchmark_role_skills("Backend Developer")
    assert "Python" in backend_skills
    assert "FastAPI" in backend_skills

    # Unknown role query raises ValueError
    with pytest.raises(ValueError, match="Unknown benchmark role"):
        get_benchmark_role_skills("Blockchain Architect")


# ── FastAPI Endpoint Integration Tests ───────────────────────────────────────

def test_fastapi_matches_rank_endpoint():
    """Test POST /api/v1/matches/rank via TestClient."""
    from fastapi.testclient import TestClient
    from app.main import app

    client = TestClient(app)

    # 1. Worked example endpoint test
    payload = {
        "student_skills": [
            {"skill_name": "Python", "score": 85.0},
            {"skill_name": "FastAPI", "score": 75.0},
            {"skill_name": "PostgreSQL", "score": 70.0},
            {"skill_name": "Git", "score": 80.0},
        ],
        "role_requirements": ["Python", "FastAPI", "PostgreSQL", "Docker"],
    }

    res = client.post("/api/v1/matches/rank", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["match_score"] == 64.5
    assert data["matched_skills"] == ["FastAPI", "PostgreSQL", "Python"]
    assert data["missing_skills"] == ["Docker"]
    assert isinstance(data["explanation"], list)

    # 2. Validation error on empty requirements (HTTP 422)
    bad_req = client.post(
        "/api/v1/matches/rank",
        json={"student_skills": [{"name": "Python", "score": 80}], "role_requirements": []},
    )
    assert bad_req.status_code == 422

    # 3. Validation error on score > 100 (HTTP 422)
    bad_score = client.post(
        "/api/v1/matches/rank",
        json={"student_skills": [{"name": "Python", "score": 150}], "role_requirements": ["Python"]},
    )
    assert bad_score.status_code == 422

    # 4. GET /api/v1/roles endpoint test
    roles_res = client.get("/api/v1/roles")
    assert roles_res.status_code == 200
    roles_data = roles_res.json()
    assert roles_data["success"] is True
    assert "Frontend Developer" in roles_data["roles"]

