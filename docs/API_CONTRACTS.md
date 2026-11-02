# SkillBridge API Contracts - Member 4 Workstream
**Workstream:** Faculty / T&P & Recruiter / Company  
**Author:** Member 4  
**Date:** October 2026  
**Status:** Implemented & Verified  

---

## 1. Authentication & Role Conventions (Interface with Member 1)
All requests must supply the role header or JWT bearer token.  
- Header: `X-User-Role: faculty_tp` (for Faculty/T&P routes)
- Header: `X-User-Role: recruiter` (for Recruiter routes)
- Standard unauthorized response: `HTTP 401 Unauthorized` (Missing credentials) or `HTTP 403 Forbidden` (Role mismatch or non-consented access).

---

## 2. Faculty / T&P Endpoints

### 2.1 Batch Analytics
- **Route:** `GET /api/v1/faculty/analytics/batch`
- **Authorized Role:** `faculty_tp`, `admin`
- **Query Parameters:**
  - `department` (string, optional): e.g., `"Computer Science & Engineering"`, `"Information Technology"`
  - `batch` (string, optional): e.g., `"2025"`, `"2026"`
  - `target_role` (string, optional): e.g., `"Backend Developer"`, `"Full Stack Developer"`
  - `skill` (string, optional): e.g., `"Python"`, `"Docker"`, `"SQL"`
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "data": {
    "total_students": 6,
    "readiness_summary": {
      "job_ready_count": 4,
      "near_ready_count": 1,
      "needs_upskilling_count": 1,
      "job_ready_pct": 66.7,
      "avg_readiness_score": 81.3
    },
    "skill_distribution": {
      "Backend": {
        "category_name": "Backend",
        "average_score": 83.4,
        "tracked_skills": ["Python", "SQL", "REST API", "PostgreSQL", "FastAPI"],
        "proficiency_band": "Advanced"
      }
    },
    "common_skill_gaps": [
      {
        "skill": "Docker",
        "avg_score": 58.2,
        "benchmark_score": 75.0,
        "gap": 16.8,
        "affected_students": 4,
        "affected_percentage": 66.7,
        "priority": "Moderate"
      }
    ],
    "is_empty": false
  }
}
```

### 2.2 Training Cohort Progress
- **Route:** `GET /api/v1/faculty/analytics/training-progress`
- **Authorized Role:** `faculty_tp`, `admin`
- **Query Parameters:** `department`, `batch`
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "data": {
    "cohorts": [
      {
        "student_id": "STU-2026-001",
        "full_name": "Aarav Sharma",
        "department": "Computer Science & Engineering",
        "enrolled_courses": ["Docker & Cloud Infrastructure"],
        "pre_score": 62.0,
        "post_score": 84.5,
        "score_gain": 22.5,
        "completion_rate": 80
      }
    ],
    "overall_average_gain": 18.2,
    "total_enrolled": 6,
    "avg_completion_rate": 78.5
  }
}
```

### 2.3 Student Readiness Roster
- **Route:** `GET /api/v1/faculty/students`
- **Authorized Role:** `faculty_tp`, `admin`
- **Query Parameters:** `department`, `batch`, `target_role`, `skill`, `readiness_tier`
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "total": 6,
  "students": [
    {
      "student_id": "STU-2026-001",
      "roll_number": "CS22B101",
      "full_name": "Aarav Sharma",
      "department": "Computer Science & Engineering",
      "batch": "2026",
      "target_role": "Backend Developer",
      "overall_readiness": 84.5,
      "readiness_tier": "Job Ready",
      "confidence": "High"
    }
  ],
  "is_empty": false
}
```

### 2.4 Student Evidence Dossier
- **Route:** `GET /api/v1/faculty/students/{student_id}`
- **Authorized Role:** `faculty_tp`, `admin`
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "student": {
    "student_id": "STU-2026-001",
    "roll_number": "CS22B101",
    "full_name": "Aarav Sharma",
    "department": "Computer Science & Engineering",
    "batch": "2026",
    "target_role": "Backend Developer",
    "overall_readiness": 84.5,
    "readiness_tier": "Job Ready",
    "confidence": "High",
    "skills": {
      "Python": {
        "score": 88.0,
        "confidence": "High",
        "assessment": 92.0,
        "github_commits": 145,
        "projects": 3,
        "verified_cert": true,
        "internship": true
      }
    },
    "evidence_summary": "Strong evidence across GitHub (145 commits), 3 verified backend projects...",
    "training_progress": {
      "pre_score": 62.0,
      "post_score": 84.5
    }
  }
}
```

### 2.5 Safe Report Export (CSV)
- **Route:** `GET /api/v1/faculty/reports/export`
- **Authorized Role:** `faculty_tp`, `admin`
- **Response:** `text/csv` attachment. Only outputs sanitized fields: `StudentID,RollNumber,FullName,Department,Batch,TargetRole,OverallReadiness,ReadinessTier,Confidence,DemoRecord`.

---

## 3. Recruiter / Company Endpoints

### 3.1 List Job Requisitions
- **Route:** `GET /api/v1/recruiter/jobs`
- **Authorized Role:** `recruiter`, `admin`
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "total": 3,
  "jobs": [
    {
      "job_id": "JOB-2026-01",
      "title": "Junior Backend Engineer",
      "company": "Nexus FinTech Labs",
      "min_readiness_score": 70.0,
      "requirements": [
        {"skill": "Python", "min_score": 75.0, "is_required": true},
        {"skill": "SQL", "min_score": 70.0, "is_required": true}
      ],
      "preferred_skills": ["PostgreSQL", "FastAPI"]
    }
  ]
}
```

### 3.2 Create Job Requisition
- **Route:** `POST /api/v1/recruiter/jobs`
- **Authorized Role:** `recruiter`, `admin`
- **Request Body:**
```json
{
  "title": "Junior Backend Engineer",
  "company": "Nexus FinTech Labs",
  "min_experience_years": 0.0,
  "min_readiness_score": 70.0,
  "department": "Engineering",
  "description": "Scalable REST microservice engineering...",
  "requirements": [
    {"skill": "Python", "min_score": 75.0, "is_required": true, "weight": 1.5},
    {"skill": "SQL", "min_score": 70.0, "is_required": true, "weight": 1.2}
  ],
  "preferred_skills": ["Docker", "Git"]
}
```
- **Validation Rules:**
  - `title` and `company` must be non-empty strings.
  - `requirements` list must contain at least 1 skill item.
  - `min_score` for every requirement must be within `[0.0, 100.0]`.

### 3.3 Explainable Candidate Ranking Endpoint
- **Route:** `GET /api/v1/recruiter/jobs/{job_id}/candidates`
- **Authorized Role:** `recruiter`, `admin`
- **Query Parameters:** `department` (optional)
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "data": {
    "job_id": "JOB-2026-01",
    "job_title": "Junior Backend Engineer",
    "company": "Nexus FinTech Labs",
    "total_matches": 5,
    "candidates": [
      {
        "student_id": "STU-2026-001",
        "candidate_alias": "Candidate CS-01",
        "department": "Computer Science & Engineering",
        "batch": "2026",
        "target_role": "Backend Developer",
        "match_score": 94.2,
        "matched_skills": [
          {"skill": "Python", "candidate_score": 88.0, "required_score": 75.0, "status": "Exceeds"}
        ],
        "missing_skills": [
          {"skill": "Docker", "candidate_score": 68.0, "required_score": 70.0, "shortfall": 2.0}
        ],
        "explanation": "Candidate meets 4 of 5 job requirements. Strong evidence verified in: Python (88/100), SQL (82/100). Docker is below target. High project & assessment evidence.",
        "shortlist_status": "shortlisted",
        "consented_placement": true,
        "confidence": "High"
      }
    ],
    "is_empty": false
  }
}
```

### 3.4 Recruiter Candidate Detail (Privacy Guarded)
- **Route:** `GET /api/v1/recruiter/candidates/{candidate_id}`
- **Authorized Role:** `recruiter`, `admin`
- **Privacy Enforcement:**
  - If candidate has `consented_placement == False`, returns `HTTP 403 Forbidden` with `"Candidate has not consented to share profile with external recruiters."`
  - Replaces student full name and roll number with `candidate_alias`.
  - Excludes internal academic marks, disciplinary flags, and remedial logs.

### 3.5 Candidate Shortlist Persistence
- **Route:** `POST /api/v1/recruiter/shortlist`
- **Authorized Role:** `recruiter`, `admin`
- **Request Body:**
```json
{
  "job_id": "JOB-2026-01",
  "student_id": "STU-2026-001",
  "status": "interview_scheduled",
  "notes": "Strong GitHub evidence, scheduled for Round 1 Technical."
}
```
- **Allowed Statuses:** `"new"`, `"shortlisted"`, `"reviewing"`, `"interview_scheduled"`, `"rejected"`.
- **Response Format (200 OK):**
```json
{
  "status": "success",
  "message": "Candidate shortlist updated",
  "record": {
    "job_id": "JOB-2026-01",
    "student_id": "STU-2026-001",
    "status": "interview_scheduled",
    "notes": "Strong GitHub evidence...",
    "updated_at": "2026-10-30T22:30:00Z"
  }
}
```
