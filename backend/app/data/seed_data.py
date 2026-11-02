"""
SkillBridge Seed and Demo Data Repository
All records are explicitly labeled with is_demo_record=True / [DEMO DATA]
in accordance with Section 17 (Security, Privacy & Fairness) & Team Member 4 specifications.
"""

from typing import List, Dict, Any

DEPARTMENTS = [
    "Computer Science & Engineering",
    "Information Technology",
    "Data Science & AI",
    "Electronics & Communication"
]

BATCHES = ["2025", "2026", "2027"]

TARGET_ROLES = [
    "Backend Developer",
    "Full Stack Developer",
    "Cloud/DevOps Engineer",
    "Data Engineer"
]

SKILL_TAXONOMY = {
    "Backend": ["Python", "SQL", "REST API", "PostgreSQL", "FastAPI", "Node.js"],
    "Frontend": ["React", "JavaScript", "HTML/CSS", "TypeScript"],
    "DevOps/Cloud": ["Docker", "AWS", "CI/CD", "Git"],
    "Foundational": ["DSA", "System Design", "OOP"]
}

# 12 Detailed student profiles with realistic multi-source evidence
STUDENTS_SEED: List[Dict[str, Any]] = [
    {
        "student_id": "STU-2026-001",
        "roll_number": "CS22B101",
        "full_name": "Aarav Sharma",
        "candidate_alias": "Candidate CS-01",
        "department": "Computer Science & Engineering",
        "batch": "2026",
        "target_role": "Backend Developer",
        "cgpa": 8.7,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 84.5,
        "readiness_tier": "Job Ready",
        "confidence": "High",
        "skills": {
            "Python": {"score": 88.0, "confidence": "High", "assessment": 92.0, "github_commits": 145, "projects": 3, "verified_cert": True, "internship": True},
            "SQL": {"score": 82.0, "confidence": "High", "assessment": 85.0, "github_commits": 60, "projects": 2, "verified_cert": True, "internship": False},
            "REST API": {"score": 79.0, "confidence": "High", "assessment": 80.0, "github_commits": 95, "projects": 3, "verified_cert": False, "internship": True},
            "DSA": {"score": 85.0, "confidence": "High", "assessment": 88.0, "github_commits": 210, "projects": 1, "verified_cert": False, "internship": False},
            "Docker": {"score": 68.0, "confidence": "Medium", "assessment": 65.0, "github_commits": 30, "projects": 1, "verified_cert": False, "internship": False},
            "AWS": {"score": 45.0, "confidence": "Low", "assessment": 50.0, "github_commits": 10, "projects": 0, "verified_cert": False, "internship": False},
            "PostgreSQL": {"score": 80.0, "confidence": "High", "assessment": 82.0, "github_commits": 45, "projects": 2, "verified_cert": True, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["Docker & Cloud Infrastructure", "Advanced System Design"],
            "completed_courses": ["RESTful Microservices with FastAPI"],
            "pre_score": 62.0,
            "post_score": 84.5,
            "completion_rate": 80
        },
        "evidence_summary": "Strong evidence across GitHub (145 commits), 3 verified backend projects, top 10% assessment score, verified PostgreSQL credential."
    },
    {
        "student_id": "STU-2026-002",
        "roll_number": "CS22B104",
        "full_name": "Priya Nair",
        "candidate_alias": "Candidate CS-04",
        "department": "Computer Science & Engineering",
        "batch": "2026",
        "target_role": "Full Stack Developer",
        "cgpa": 9.1,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 88.0,
        "readiness_tier": "Job Ready",
        "confidence": "High",
        "skills": {
            "React": {"score": 90.0, "confidence": "High", "assessment": 94.0, "github_commits": 180, "projects": 4, "verified_cert": True, "internship": True},
            "JavaScript": {"score": 92.0, "confidence": "High", "assessment": 95.0, "github_commits": 200, "projects": 4, "verified_cert": True, "internship": True},
            "Python": {"score": 75.0, "confidence": "Medium", "assessment": 78.0, "github_commits": 50, "projects": 2, "verified_cert": False, "internship": False},
            "REST API": {"score": 84.0, "confidence": "High", "assessment": 86.0, "github_commits": 110, "projects": 3, "verified_cert": True, "internship": True},
            "DSA": {"score": 80.0, "confidence": "High", "assessment": 82.0, "github_commits": 120, "projects": 1, "verified_cert": False, "internship": False},
            "Docker": {"score": 55.0, "confidence": "Low", "assessment": 58.0, "github_commits": 15, "projects": 1, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["Docker Essentials"],
            "completed_courses": ["Modern React & State Management", "Clean REST API Architecture"],
            "pre_score": 70.0,
            "post_score": 88.0,
            "completion_rate": 90
        },
        "evidence_summary": "Outstanding frontend & API skills, 4 production-grade React apps, verified internship at SaaS startup."
    },
    {
        "student_id": "STU-2026-003",
        "roll_number": "IT22B205",
        "full_name": "Rohan Deshmukh",
        "candidate_alias": "Candidate IT-05",
        "department": "Information Technology",
        "batch": "2026",
        "target_role": "Cloud/DevOps Engineer",
        "cgpa": 7.9,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 72.0,
        "readiness_tier": "Near Ready",
        "confidence": "Medium",
        "skills": {
            "Docker": {"score": 78.0, "confidence": "High", "assessment": 80.0, "github_commits": 85, "projects": 3, "verified_cert": True, "internship": False},
            "AWS": {"score": 74.0, "confidence": "Medium", "assessment": 72.0, "github_commits": 40, "projects": 2, "verified_cert": True, "internship": False},
            "Git": {"score": 85.0, "confidence": "High", "assessment": 88.0, "github_commits": 190, "projects": 3, "verified_cert": False, "internship": False},
            "Python": {"score": 64.0, "confidence": "Medium", "assessment": 68.0, "github_commits": 45, "projects": 1, "verified_cert": False, "internship": False},
            "CI/CD": {"score": 70.0, "confidence": "Medium", "assessment": 72.0, "github_commits": 35, "projects": 2, "verified_cert": False, "internship": False},
            "DSA": {"score": 58.0, "confidence": "Low", "assessment": 60.0, "github_commits": 40, "projects": 0, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["DSA Intermediate Bootcamp", "Kubernetes Administration"],
            "completed_courses": ["AWS Cloud Practitioner prep"],
            "pre_score": 55.0,
            "post_score": 72.0,
            "completion_rate": 65
        },
        "evidence_summary": "Solid containerization & cloud foundation; Needs practice in DSA for technical screens."
    },
    {
        "student_id": "STU-2026-004",
        "roll_number": "DS22B302",
        "full_name": "Ananya Mukherjee",
        "candidate_alias": "Candidate DS-02",
        "department": "Data Science & AI",
        "batch": "2026",
        "target_role": "Data Engineer",
        "cgpa": 8.9,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 86.0,
        "readiness_tier": "Job Ready",
        "confidence": "High",
        "skills": {
            "Python": {"score": 92.0, "confidence": "High", "assessment": 95.0, "github_commits": 160, "projects": 4, "verified_cert": True, "internship": True},
            "SQL": {"score": 90.0, "confidence": "High", "assessment": 92.0, "github_commits": 90, "projects": 3, "verified_cert": True, "internship": True},
            "PostgreSQL": {"score": 86.0, "confidence": "High", "assessment": 88.0, "github_commits": 70, "projects": 3, "verified_cert": True, "internship": False},
            "DSA": {"score": 78.0, "confidence": "Medium", "assessment": 80.0, "github_commits": 110, "projects": 1, "verified_cert": False, "internship": False},
            "AWS": {"score": 68.0, "confidence": "Medium", "assessment": 70.0, "github_commits": 30, "projects": 1, "verified_cert": False, "internship": False},
            "Docker": {"score": 62.0, "confidence": "Medium", "assessment": 60.0, "github_commits": 25, "projects": 1, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["Distributed Data Pipelines with Spark"],
            "completed_courses": ["Advanced SQL Analytics", "Python for Data Engineering"],
            "pre_score": 68.0,
            "post_score": 86.0,
            "completion_rate": 85
        },
        "evidence_summary": "Top tier SQL & Python pipeline scores, 4 reproducible data engineering repositories."
    },
    {
        "student_id": "STU-2026-005",
        "roll_number": "CS22B115",
        "full_name": "Vikram Rathore",
        "candidate_alias": "Candidate CS-15",
        "department": "Computer Science & Engineering",
        "batch": "2026",
        "target_role": "Backend Developer",
        "cgpa": 7.4,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 63.0,
        "readiness_tier": "Needs Upskilling",
        "confidence": "Medium",
        "skills": {
            "Python": {"score": 68.0, "confidence": "Medium", "assessment": 70.0, "github_commits": 40, "projects": 1, "verified_cert": False, "internship": False},
            "SQL": {"score": 62.0, "confidence": "Medium", "assessment": 65.0, "github_commits": 20, "projects": 1, "verified_cert": False, "internship": False},
            "REST API": {"score": 58.0, "confidence": "Low", "assessment": 60.0, "github_commits": 15, "projects": 1, "verified_cert": False, "internship": False},
            "DSA": {"score": 55.0, "confidence": "Medium", "assessment": 58.0, "github_commits": 70, "projects": 0, "verified_cert": False, "internship": False},
            "Docker": {"score": 38.0, "confidence": "Low", "assessment": 40.0, "github_commits": 0, "projects": 0, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["Backend Development Foundation", "DSA Core Problems"],
            "completed_courses": [],
            "pre_score": 48.0,
            "post_score": 63.0,
            "completion_rate": 45
        },
        "evidence_summary": "Enrolled in remedial backend cohort; currently bridging gaps in REST APIs and Docker."
    },
    {
        "student_id": "STU-2026-006",
        "roll_number": "EC22B401",
        "full_name": "Kavita Reddy",
        "candidate_alias": "Candidate EC-01",
        "department": "Electronics & Communication",
        "batch": "2026",
        "target_role": "Backend Developer",
        "cgpa": 8.2,
        "consented_placement": False, # Strict privacy demonstration: student opted OUT of recruiter sharing!
        "is_demo_record": True,
        "overall_readiness": 75.0,
        "readiness_tier": "Near Ready",
        "confidence": "Medium",
        "skills": {
            "Python": {"score": 80.0, "confidence": "High", "assessment": 84.0, "github_commits": 80, "projects": 2, "verified_cert": True, "internship": False},
            "SQL": {"score": 72.0, "confidence": "Medium", "assessment": 75.0, "github_commits": 30, "projects": 1, "verified_cert": False, "internship": False},
            "DSA": {"score": 76.0, "confidence": "High", "assessment": 80.0, "github_commits": 130, "projects": 0, "verified_cert": False, "internship": False},
            "REST API": {"score": 65.0, "confidence": "Medium", "assessment": 68.0, "github_commits": 25, "projects": 1, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["FastAPI & Microservices"],
            "completed_courses": ["Python Intermediate"],
            "pre_score": 58.0,
            "post_score": 75.0,
            "completion_rate": 70
        },
        "evidence_summary": "Good cross-department transition to software development; Opted out of 3rd-party recruiter listings."
    },
    {
        "student_id": "STU-2025-007",
        "roll_number": "CS21B108",
        "full_name": "Tanmay Verma",
        "candidate_alias": "Candidate CS-08",
        "department": "Computer Science & Engineering",
        "batch": "2025",
        "target_role": "Backend Developer",
        "cgpa": 8.5,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 89.0,
        "readiness_tier": "Job Ready",
        "confidence": "High",
        "skills": {
            "Python": {"score": 90.0, "confidence": "High", "assessment": 92.0, "github_commits": 220, "projects": 4, "verified_cert": True, "internship": True},
            "FastAPI": {"score": 88.0, "confidence": "High", "assessment": 90.0, "github_commits": 130, "projects": 3, "verified_cert": False, "internship": True},
            "SQL": {"score": 84.0, "confidence": "High", "assessment": 86.0, "github_commits": 80, "projects": 3, "verified_cert": True, "internship": True},
            "Docker": {"score": 76.0, "confidence": "High", "assessment": 78.0, "github_commits": 50, "projects": 2, "verified_cert": True, "internship": False},
            "REST API": {"score": 91.0, "confidence": "High", "assessment": 94.0, "github_commits": 150, "projects": 4, "verified_cert": True, "internship": True},
            "DSA": {"score": 82.0, "confidence": "High", "assessment": 85.0, "github_commits": 180, "projects": 1, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": [],
            "completed_courses": ["Enterprise Architecture", "Docker in Production"],
            "pre_score": 75.0,
            "post_score": 89.0,
            "completion_rate": 100
        },
        "evidence_summary": "Completed 6-month software development internship; 4 production FastAPI microservices."
    },
    {
        "student_id": "STU-2025-008",
        "roll_number": "IT21B210",
        "full_name": "Meera Sen",
        "candidate_alias": "Candidate IT-10",
        "department": "Information Technology",
        "batch": "2025",
        "target_role": "Full Stack Developer",
        "cgpa": 8.3,
        "consented_placement": True,
        "is_demo_record": True,
        "overall_readiness": 81.0,
        "readiness_tier": "Job Ready",
        "confidence": "High",
        "skills": {
            "React": {"score": 85.0, "confidence": "High", "assessment": 88.0, "github_commits": 140, "projects": 3, "verified_cert": True, "internship": True},
            "Node.js": {"score": 80.0, "confidence": "High", "assessment": 82.0, "github_commits": 90, "projects": 2, "verified_cert": False, "internship": True},
            "SQL": {"score": 76.0, "confidence": "Medium", "assessment": 78.0, "github_commits": 40, "projects": 2, "verified_cert": False, "internship": False},
            "REST API": {"score": 82.0, "confidence": "High", "assessment": 85.0, "github_commits": 80, "projects": 2, "verified_cert": False, "internship": True},
            "Docker": {"score": 60.0, "confidence": "Medium", "assessment": 62.0, "github_commits": 20, "projects": 1, "verified_cert": False, "internship": False}
        },
        "training_progress": {
            "enrolled_courses": ["Full Stack MERN Advanced"],
            "completed_courses": ["Frontend Performance Optimization"],
            "pre_score": 65.0,
            "post_score": 81.0,
            "completion_rate": 90
        },
        "evidence_summary": "Active contributor to open-source UI libraries, strong Node/React integration evidence."
    }
]

# Initial job requisitions posted by recruiters
JOBS_SEED: List[Dict[str, Any]] = [
    {
        "job_id": "JOB-2026-01",
        "title": "Junior Backend Engineer",
        "company": "Nexus FinTech Labs",
        "department": "Engineering",
        "min_experience_years": 0.0,
        "min_readiness_score": 70.0,
        "requirements": [
            {"skill": "Python", "min_score": 75.0, "is_required": True, "weight": 1.5},
            {"skill": "SQL", "min_score": 70.0, "is_required": True, "weight": 1.2},
            {"skill": "REST API", "min_score": 65.0, "is_required": True, "weight": 1.0},
            {"skill": "Docker", "min_score": 50.0, "is_required": False, "weight": 0.8},
            {"skill": "DSA", "min_score": 65.0, "is_required": True, "weight": 1.0}
        ],
        "preferred_skills": ["PostgreSQL", "FastAPI", "Git"],
        "description": "Looking for entry-level backend engineers capable of building scalable REST microservices with Python and relational databases.",
        "is_active": True,
        "created_at": "2026-10-15T10:00:00Z"
    },
    {
        "job_id": "JOB-2026-02",
        "title": "Associate Full Stack Developer",
        "company": "CloudScale Systems",
        "department": "Platform Services",
        "min_experience_years": 0.0,
        "min_readiness_score": 75.0,
        "requirements": [
            {"skill": "React", "min_score": 80.0, "is_required": True, "weight": 1.5},
            {"skill": "JavaScript", "min_score": 80.0, "is_required": True, "weight": 1.2},
            {"skill": "REST API", "min_score": 70.0, "is_required": True, "weight": 1.0},
            {"skill": "DSA", "min_score": 70.0, "is_required": True, "weight": 1.0}
        ],
        "preferred_skills": ["Node.js", "Docker", "TypeScript"],
        "description": "Seeking skilled frontend & full stack engineers with solid React experience and clean API design skills.",
        "is_active": True,
        "created_at": "2026-10-20T14:30:00Z"
    },
    {
        "job_id": "JOB-2026-03",
        "title": "Cloud Infrastructure Associate",
        "company": "Aura Cloud Networks",
        "department": "DevOps / Infrastructure",
        "min_experience_years": 0.0,
        "min_readiness_score": 65.0,
        "requirements": [
            {"skill": "Docker", "min_score": 70.0, "is_required": True, "weight": 1.5},
            {"skill": "AWS", "min_score": 65.0, "is_required": True, "weight": 1.2},
            {"skill": "Git", "min_score": 75.0, "is_required": True, "weight": 1.0},
            {"skill": "CI/CD", "min_score": 60.0, "is_required": False, "weight": 0.8}
        ],
        "preferred_skills": ["Python", "Linux", "Kubernetes"],
        "description": "Junior DevOps position focused on cloud automation, container management, and CI/CD pipelines.",
        "is_active": True,
        "created_at": "2026-10-25T09:15:00Z"
    }
]

# Recruiter candidate shortlist store (in-memory persistent state)
SHORTLIST_STORE: Dict[str, Dict[str, Any]] = {
    # Key format: f"{job_id}:{student_id}"
    "JOB-2026-01:STU-2026-001": {
        "job_id": "JOB-2026-01",
        "student_id": "STU-2026-001",
        "status": "shortlisted",
        "notes": "Impressive project repository with verified PostgreSQL credential.",
        "updated_at": "2026-10-28T16:00:00Z"
    }
}
