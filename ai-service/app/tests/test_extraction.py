"""
Tests for SkillBridge AI Service Phase 1 - Skill Extraction
"""
import pytest
from app.core.extractor import extract_skills
from app.core.taxonomy import SKILLS_TAXONOMY


def test_taxonomy_integrity():
    """Verify taxonomy entries have required keys and lowercase aliases."""
    assert len(SKILLS_TAXONOMY) >= 30
    for name, data in SKILLS_TAXONOMY.items():
        assert "aliases" in data
        assert "keywords" in data
        assert "category" in data
        for alias in data["aliases"]:
            assert alias == alias.lower(), f"Alias '{alias}' in {name} must be lowercase"


def test_extract_skills_python_resume():
    """Test extracting Python from a sample resume text."""
    text = "Proficient in Python and Django. Developed FastAPI microservices with unit tests."
    results = extract_skills(text, source="resume")
    skill_names = [r.name for r in results]

    assert "Python" in skill_names
    assert "FastAPI" in skill_names
    assert "Django" in skill_names

    py_skill = next(r for r in results if r.name == "Python")
    assert 0.0 < py_skill.confidence <= 1.0
    assert py_skill.evidence_snippet != ""
    assert "Python" in py_skill.evidence_snippet or "FastAPI" in py_skill.evidence_snippet or "Django" in py_skill.evidence_snippet


def test_extract_skills_frontend_react():
    """Test extracting React, HTML, CSS, Tailwind CSS from frontend project text."""
    text = "Built a responsive single-page application using React, Vite, Tailwind CSS, and HTML5."
    results = extract_skills(text, source="project")
    skill_names = [r.name for r in results]

    assert "React" in skill_names
    assert "Tailwind CSS" in skill_names
    assert "HTML" in skill_names


def test_extract_skills_database_and_backend():
    """Test extracting Node.js, Express.js, MongoDB, SQL."""
    text = "Engineered backend APIs using Node.js, Express.js, and MongoDB with Mongoose ODM. Handled SQL queries in MySQL."
    results = extract_skills(text, source="github")
    skill_names = [r.name for r in results]

    assert "Node.js" in skill_names
    assert "Express.js" in skill_names
    assert "MongoDB" in skill_names
    assert "SQL" in skill_names
    assert "MySQL" in skill_names


def test_no_false_positives_for_unrelated_text():
    """Test that unrelated everyday prose produces zero extracted skills."""
    text = "The quick brown fox jumps over the lazy dog on a sunny Sunday afternoon."
    results = extract_skills(text, source="text")
    assert len(results) == 0


def test_word_boundary_isolation():
    """Ensure sub-word occurrences do not trigger skill hits (e.g. 'flux' != 'SQL')."""
    text = "The flux of fluid through a pipe generates interesting physical dynamics."
    results = extract_skills(text, source="text")
    skill_names = [r.name for r in results]
    assert "SQL" not in skill_names


def test_short_word_ambiguity_protection():
    """Common verbs like 'go' must not trigger 'Go' language without unambiguous alias or context."""
    text = "I will go to the campus library and read a book about history."
    results = extract_skills(text, source="text")
    skill_names = [r.name for r in results]
    assert "Go" not in skill_names

    # But 'golang' or 'goroutine' SHOULD trigger Go
    go_text = "Implemented high-performance concurrency workers using Golang and goroutines."
    go_results = extract_skills(go_text, source="github")
    go_skills = [r.name for r in go_results]
    assert "Go" in go_skills


def test_empty_and_whitespace_input():
    """Empty or whitespace-only input returns an empty list without error."""
    assert extract_skills("", source="text") == []
    assert extract_skills("   \n\t  ", source="resume") == []


def test_source_weighting_affects_confidence():
    """Resume and GitHub sources should yield higher confidence than plain text."""
    text = "Developed machine learning models using Python and scikit-learn for classification."
    results_resume = extract_skills(text, source="resume")
    results_text = extract_skills(text, source="text")

    py_resume = next(r for r in results_resume if r.name == "Python")
    py_text = next(r for r in results_text if r.name == "Python")

    assert py_resume.confidence > py_text.confidence
    assert 0.0 < py_resume.confidence <= 1.0
    assert 0.0 < py_text.confidence <= 1.0


# ── FastAPI Endpoint Integration Tests (when FastAPI & TestClient available) ──

def test_fastapi_endpoints():
    """Test HTTP endpoints via FastAPI TestClient if installed."""
    try:
        from fastapi.testclient import TestClient
        from app.main import app

        client = TestClient(app)

        # 1. Health check
        res_health = client.get("/health")
        assert res_health.status_code == 200
        health_data = res_health.json()
        assert health_data["status"] == "healthy"
        assert health_data["service"] == "skillbridge-ai"

        # 2. Skill extraction valid payload
        res_extract = client.post(
            "/api/v1/skills/extract",
            json={
                "text": "Proficient in C++, Python, and Data Structures & Algorithms. Solved 300+ problems on LeetCode.",
                "source": "leetcode"
            }
        )
        assert res_extract.status_code == 200
        extract_data = res_extract.json()
        assert "skills" in extract_data
        assert "extracted_count" in extract_data
        assert extract_data["extracted_count"] == len(extract_data["skills"])

        extracted_names = [s["name"] for s in extract_data["skills"]]
        assert "Python" in extracted_names
        assert "C++" in extracted_names
        assert "Data Structures" in extracted_names

        for s in extract_data["skills"]:
            assert "name" in s
            assert "confidence" in s
            assert "evidence_snippet" in s
            assert 0.0 < s["confidence"] <= 1.0

        # 3. Skill extraction empty text
        res_empty = client.post(
            "/api/v1/skills/extract",
            json={"text": "   ", "source": "text"}
        )
        assert res_empty.status_code == 200
        assert res_empty.json()["extracted_count"] == 0
        assert res_empty.json()["skills"] == []

        # 4. Validation error for missing text field
        res_invalid = client.post(
            "/api/v1/skills/extract",
            json={"source": "resume"}
        )
        assert res_invalid.status_code == 422

        # 5. File upload extension test (.docx)
        import io
        import docx
        doc = docx.Document()
        doc.add_paragraph("Experienced Java and Spring Boot engineer with Docker and AWS experience.")
        f = io.BytesIO()
        doc.save(f)
        f.seek(0)

        res_file = client.post(
            "/api/v1/skills/extract/file",
            files={"file": ("candidate_resume.docx", f, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
        )
        assert res_file.status_code == 200
        file_data = res_file.json()
        assert file_data["extracted_count"] >= 3
        file_skills = [s["name"] for s in file_data["skills"]]
        assert "Java" in file_skills
        assert "Spring Boot" in file_skills
        assert "Docker" in file_skills

    except ImportError:
        pytest.skip("FastAPI or TestClient not installed in the test environment")

