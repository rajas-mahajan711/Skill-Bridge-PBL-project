# Student Module Documentation (Person 2)
**SkillBridge AI-Powered Skill Intelligence Platform**

## 1. Overview & Person 2 Scope

As Person 2, our responsibility is to build the student-facing module from scratch. This encompasses:
- React frontend pages and state handling for students.
- Express REST API endpoints for student profiles, evidence CRUD, skill analysis snapshots, and learning progress.
- MongoDB data models for student profiles, evidence, assessments, learning progress, and analysis snapshots.
- Secure authentication integration and ownership-based access control.
- FastAPI AI/ML microservice integration for explainable scoring and recommendations.

### Explicit Scope Boundaries
- **In Scope (Person 2)**: Student Dashboard, Profile Management, Evidence Portfolio, Skill Gap Analysis, Learning & Progress, Student Authentication adapters, and private upload handling.
- **Out of Scope (Delegated to Future Teammates)**: Faculty / TPO Dashboard (Person 3), Recruiter Dashboard & Placement Portal (Person 4), System Administrator Panel (Person 1).
- **Interface Compatibility**: Shared models (User, RoleDefinition, Skill, LearningResource) and JWT authentication contracts are designed so Person 1 can cleanly integrate or replace temporary adapters without breaking student functionality.

---

## 2. Frontend Student Routes

| Route | Component | Purpose |
| :--- | :--- | :--- |
| `/login` | `LoginPage` | Student authentication with PBL demo quick-fill. |
| `/register` | `RegisterPage` | Student account registration. |
| `/student/dashboard` | `DashboardPage` | Consolidated intelligence dashboard with profile summary, top skills, readiness gauge, recommended roles, and recent activity. |
| `/student/profile` | `ProfilePage` | View and edit personal headline, bio, academic details, and portfolio URLs. |
| `/student/evidence` | `EvidencePage` | View, filter, add, edit, and delete skill evidence records and download private documents. |
| `/student/skill-gap` | `SkillGapPage` | Role benchmark comparison with categorized gaps (Meeting, Weak, Low Confidence, Missing) and actionable recommendations. |
| `/student/learning` | `LearningPage` | Curated course catalog with progress slider, status tracking, and gap linkage. |

---

## 3. Key Student Features

### A. Consolidated Student Dashboard (`/student/dashboard`)
1. **Profile Summary Card**: Displays student name, degree, department, graduation year, and an animated progress bar indicating profile completion percentage.
2. **Evidence-Backed Skill Profile**: Lists evaluated skills with proficiency scores (0-100), multi-source evidence counts, and confidence pills (`High`, `Medium`, `Low`).
3. **Role Readiness Widget**: Gauges alignment against the student's selected target role, displaying readiness percentage, readiness band (`High Readiness`, `Developing`), and gap counts.
4. **Recommended Roles**: Displays top 3 matching industry roles ranked by alignment with the student's portfolio.
5. **Recent Activity Timeline**: Shows submissions, assessments, and status updates with timestamps.
6. **Learning Summary**: Summarizes active/completed modules and recommends a concrete next step.

### B. Profile Management (`/student/profile`)
- **Personal Details**: Headline, bio, contact number, technical interests keywords.
- **Academic Credentials**: College, department, degree, current year (1-5), graduation year, CGPA.
- **External Portfolios**: GitHub, LinkedIn, LeetCode, Codeforces, Personal Portfolio URLs.
- **Security Guard**: Role escalations are blocked on both client and server; students cannot elevate themselves to faculty or admin.

### C. Evidence Portfolio & Secure Uploads (`/student/evidence`)
- **Supported Categories**: Projects, Certificates, Internships, Assessments, Coding Profiles, Achievements, Resumes.
- **Connection Statuses**:
  - `Not Connected`: No external URL added.
  - `URL Added`: External URL provided, awaiting independent verification.
  - `Connected & Verified`: Verified via proctored assessment or verified credential.
- **File Upload Security**:
  - Max 5MB file size limit.
  - Strict MIME whitelist (`application/pdf`, `image/png`, `image/jpeg`, Word docs).
  - Stored in private server directory (`backend/uploads/`) with unguessable random filenames.
  - Served exclusively via authorized download endpoint checking `student === req.user._id`.

### D. Skill-Gap Analysis (`/student/skill-gap`)
- Role selector querying all active role definitions.
- Visual breakdown of required competencies into 4 distinct categories:
  1. **Meeting**: Meets or exceeds required proficiency with sufficient confidence.
  2. **Below Target Level (Weak)**: Evidence exists, but proficiency falls below role threshold.
  3. **Low Evidence Confidence**: Preliminary claims or unverified evidence exist, but lack independent confirmation.
  4. **Unevidenced (Missing)**: No evidence records exist for this skill.
- Direct "Find Learning Modules" link for each unfulfilled competency.

### E. Learning & Progress Tracking (`/student/learning`)
- Curated course catalog from genuine sources (University of Helsinki, freeCodeCamp, Harvard CS50, MDN, FastAPI).
- Difficulty filtering (`Beginner`, `Intermediate`, `Advanced`) and skill search.
- Interactive progress percentage updates (25%, 50%, 75%, 100%) and completion state transitions persisted in MongoDB.
- Clearly flags demo/seeded resources.
