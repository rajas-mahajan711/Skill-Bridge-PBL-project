"""
Unit tests for FastAPI Skill Intelligence Service
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_analyze_skills_insufficient_evidence():
    payload = {
        "evidence_items": [],
        "target_skills": ["React"],
    }
    response = client.post("/analyze-skills", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["insufficient_evidence_count"] == 1
    assert data["skills"][0]["status"] == "insufficient_evidence"
    assert data["skills"][0]["score"] is None
    assert data["skills"][0]["confidence_level"] == "Low"


def test_analyze_skills_with_verified_evidence():
    payload = {
        "evidence_items": [
            {
                "title": "College Full-Stack Assessment",
                "type": "assessment",
                "source": "SkillBridge College Assessment Portal",
                "verification_status": "verified",
                "evidence_date": "2026-09-15",
                "related_skills": ["React", "TypeScript", "Node.js"],
                "score": 92.0,
            },
            {
                "title": "E-Commerce Frontend Project",
                "type": "project",
                "source": "GitHub",
                "verification_status": "verified",
                "evidence_date": "2026-08-20",
                "related_skills": ["React", "TypeScript"],
            },
        ],
    }
    response = client.post("/analyze-skills", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["evaluated_count"] >= 2

    react_skill = next((s for s in data["skills"] if s["skill_name"] == "React"), None)
    assert react_skill is not None
    assert react_skill["status"] == "evaluated"
    assert react_skill["score"] is not None
    assert react_skill["score"] > 80.0
    assert react_skill["confidence_level"] in ("Medium", "High")
    assert react_skill["supporting_evidence_count"] == 2


def test_skill_gap_analysis():
    payload = {
        "target_role": {
            "title": "Frontend Developer",
            "required_skills": [
                {"skill_name": "React", "min_level": 70.0, "importance": "required"},
                {"skill_name": "CSS3", "min_level": 60.0, "importance": "required"},
                {"skill_name": "Docker", "min_level": 50.0, "importance": "preferred"},
            ],
        },
        "student_skills": [
            {
                "skill_name": "React",
                "score": 85.0,
                "confidence_score": 0.8,
                "confidence_level": "High",
                "supporting_evidence_count": 2,
                "evidence_sources": ["GitHub", "Assessment"],
                "explanation": "High proficiency",
                "limitations": "None",
                "status": "evaluated",
            },
            {
                "skill_name": "CSS3",
                "score": 45.0,  # Below 60 -> Weak
                "confidence_score": 0.5,
                "confidence_level": "Medium",
                "supporting_evidence_count": 1,
                "evidence_sources": ["Project"],
                "explanation": "Basic CSS",
                "limitations": "Limited responsive evidence",
                "status": "evaluated",
            },
            # Docker is completely missing
        ],
    }
    response = client.post("/skill-gaps", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["skills_meeting_count"] == 1
    assert data["skills_weak_count"] == 1
    assert data["skills_missing_count"] == 1
    assert data["readiness_score"] > 0

    docker_gap = next((g for g in data["gaps"] if g["skill_name"] == "Docker"), None)
    assert docker_gap is not None
    assert docker_gap["status"] == "missing"


def test_role_matching():
    payload = {
        "student_skills": [
            {
                "skill_name": "React",
                "score": 85.0,
                "confidence_score": 0.8,
                "confidence_level": "High",
                "supporting_evidence_count": 2,
                "evidence_sources": ["Assessment"],
                "explanation": "Expert",
                "limitations": "None",
                "status": "evaluated",
            }
        ],
        "available_roles": [
            {
                "title": "Frontend Developer",
                "required_skills": [
                    {"skill_name": "React", "min_level": 70.0, "importance": "required"}
                ],
            },
            {
                "title": "Data Analyst",
                "required_skills": [
                    {"skill_name": "Python", "min_level": 75.0, "importance": "required"},
                    {"skill_name": "SQL", "min_level": 70.0, "importance": "required"},
                ],
            },
        ],
    }
    response = client.post("/match-role", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Frontend Developer should rank higher due to React match
    assert data["recommendations"][0]["role_title"] == "Frontend Developer"
    assert data["recommendations"][0]["readiness_score"] >= 80.0


def test_resume_extraction():
    payload = {
        "text_content": "Experienced in building responsive applications with React, TypeScript, and Node.js. Used MongoDB for database."
    }
    response = client.post("/extract-skills", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    extracted_names = [s["skill_name"] for s in data["extracted_skills"]]
    assert "React" in extracted_names
    assert "TypeScript" in extracted_names
    assert "Node.js" in extracted_names
    assert "MongoDB" in extracted_names
    assert "unverified" in data["notice"].lower()
