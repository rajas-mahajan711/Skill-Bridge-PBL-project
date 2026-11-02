# SkillBridge - Member 4 Workstream
**Workstream:** Faculty / Training & Placement (T&P) & Recruiter / Company Scope  
**Author:** Team Member 4  
**Project:** SkillBridge AI-Powered Student Skill Intelligence & Placement Platform  

---

## 🚀 Quick Start Guide

### 1. Run the Standalone API & Frontend Server
The deliverable includes a self-contained server that requires **no external pip packages**:
```powershell
# From the project root
python backend/standalone_server.py 8000
```
Open your browser at:  
👉 **`http://127.0.0.1:8000/`**

### 2. Run the Automated Test Suite
```powershell
python backend/tests/test_api.py
```
*Runs all 12 unit and integration tests verifying RBAC, analytics, candidate ranking, privacy safeguards, and shortlisting.*

---

## 📋 What Was Built for Member 4

### Faculty / Training & Placement (T&P) Scope
1. **Batch-Level Skill Distribution:** Synthesizes multi-source scores across 4 skill categories (Backend, Frontend, DevOps, Foundational) with average scores and proficiency tiers (Advanced, Intermediate, Developing).
2. **Common Skill Gaps vs 75% Benchmark:** Identifies cohort shortfalls, percentage of affected students, and priority levels (Critical, Moderate, Low).
3. **Readiness Summaries:** Tracks placement readiness tiers (Job Ready 80%+, Near Ready, Needs Upskilling) and average cohort readiness.
4. **Multi-Parameter Filtering:** Real-time filtering by **Department**, **Batch**, **Target Role**, and **Skill**, using only fields actually present in the agreed data model.
5. **Student Readiness & Evidence Dossier:** Detailed student view with multi-source evidence (GitHub commits, college assessment scores, verified projects, certificates, internships) and evidence confidence ratings (High / Medium / Low).
6. **Training Progress Tracker:** Tracks pre- vs post-training score deltas (+15 to +25 points gain) and course completion rates.
7. **Role-Safe CSV Export:** Safely exports placement readiness data without leaking internal student disciplinary or auth tokens.

### Recruiter / Company Scope
1. **Job Requisition Builder:** Create/upload job descriptions with required/preferred skills, experience requirements, and minimum score thresholds (0 - 100), with robust form validation.
2. **AI Candidate Matching & Ranking:** Ranks consented candidates with normalized match scores (0 - 100%), matched skills badges, missing skills shortfalls, and explainable AI reasoning.
3. **Explainable AI Matching:** Transparent reasons explaining why each candidate was ranked, highlighting evidence diversity without blackbox scoring.
4. **Candidate Privacy & Consent Safeguards:**
   - **Consent Verification:** Students who opted out of placement sharing (`consented_placement=False`) are completely excluded from recruiter results.
   - **Direct Access Prevention:** Unauthorized queries on non-consented profiles return `403 Forbidden`.
   - **Data Minimization:** Recruiters view candidate aliases (`Candidate CS-01`), withholding sensitive personal attributes (no caste, gender, religion, age).
5. **Shortlist Pipeline Persistence:** Actionable shortlisting (`shortlisted`, `reviewing`, `interview_scheduled`, `rejected`) with notes, persisted via backend REST endpoints.
6. **Empty & Error States:** Clear guidance when zero candidates match high thresholds, with suggestions to relax criteria.

---

## 🎨 Design System & Reference Styling
- **Theme:** Neutral light background (`#f8fafc`), clean card surfaces (`#ffffff`), border outlines (`#e2e8f0`).
- **Accent:** Professional Teal (`#0d9488` / `#0f766e`).
- **Layout:** Responsive sidebar, topbar with active role pill and demo indicator badge (`[DEMO DATA - 2026 COHORT]`), compact tables, and status badges.
- **Interactive Role Switcher:** Toggle instantly between Faculty and Recruiter personas with live route protection!

---

## 📁 Repository Structure
```
skillbridge/
├── backend/
│   ├── app/
│   │   ├── main.py                  # API router & dispatcher
│   │   ├── core/
│   │   │   └── auth.py              # RBAC middleware & privacy sanitizers
│   │   ├── data/
│   │   │   └── seed_data.py         # Labeled demo seed dataset
│   │   ├── models/
│   │   │   └── schemas.py           # Data models for analytics & matching
│   │   ├── services/
│   │   │   ├── analytics_service.py # Batch analytics & CSV export
│   │   │   └── matching_service.py  # Candidate ranking & shortlisting
│   │   └── routers/
│   │       ├── faculty.py           # Faculty / T&P handlers
│   │       └── recruiter.py         # Recruiter / Company handlers
│   ├── standalone_server.py         # Self-contained zero-dependency HTTP server
│   └── tests/
│       └── test_api.py              # 12-test unit & integration suite
├── frontend/
│   ├── index.html                   # Single-Page Application shell
│   ├── app.js                       # Reactive frontend engine
│   ├── styles.css                   # Custom responsive design system
│   └── src/components/
│       ├── FacultyDashboard.jsx     # Modular React component
│       └── RecruiterDashboard.jsx   # Modular React component
├── docs/
│   ├── API_CONTRACTS.md             # REST/OpenAPI contracts for team members
│   ├── ARCHITECTURE.md              # Technical design, RBAC & AI matching formulas
│   └── VERIFICATION_REPORT.md       # Acceptance checklist & test results
└── README.md                        # Quick start and project overview
```
