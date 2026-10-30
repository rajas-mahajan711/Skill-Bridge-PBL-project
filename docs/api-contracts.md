# Express REST API Contracts Documentation
**SkillBridge AI Skill Intelligence Platform — Student Module**

All endpoints are prefixed with `/api`. Authenticated endpoints require the `Authorization: Bearer <token>` header.

---

## 1. Authentication Endpoints

### `POST /api/auth/register`
Creates a new student account and initializes a linked `StudentProfile`.

**Request Body:**
```json
{
  "name": "Aamrapali Sharma",
  "email": "student@skillbridge.edu",
  "password": "Student@123",
  "role": "student"
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Account successfully registered.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "67...",
    "name": "Aamrapali Sharma",
    "email": "student@skillbridge.edu",
    "role": "student"
  },
  "profile": { "_id": "67...", "user": "67...", "headline": "" }
}
```

---

### `POST /api/auth/login`
Authenticates student and returns JWT session token.

**Request Body:**
```json
{
  "email": "student@skillbridge.edu",
  "password": "Student@123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "user": {
    "id": "67...",
    "name": "Aamrapali Sharma",
    "email": "student@skillbridge.edu",
    "role": "student"
  },
  "profile": { ... }
}
```

---

### `GET /api/auth/me`
Returns currently authenticated user and linked student profile. Requires Bearer Token.

---

## 2. Student Profile & Dashboard Endpoints

### `GET /api/students/me`
Retrieves the authenticated student's profile, academic data, and completion percentage.

### `PUT /api/students/me`
Updates permitted profile fields (headline, bio, academic, socialLinks, technicalInterests, targetRoleId). Prevents role escalation.

### `GET /api/students/me/dashboard`
Returns consolidated dashboard data:
- `profileSummary`: Name, college, department, graduation year, completion percentage.
- `skillsOverview`: Total evaluated skills and top skills with scores and confidence.
- `roleReadiness`: Readiness score, band, meeting skills, weak skills, and missing skills.
- `recommendedRoles`: Ranked role matches with match percentage and reasons.
- `recentActivity`: Audit trail of submissions and assessments.
- `learningSummary`: Active count, completed count, progress percentage, suggested next action.

### `GET /api/students/me/skills`
Returns full evaluated skill records calculated from student evidence.

---

## 3. Evidence Management Endpoints

### `GET /api/evidence`
Retrieves student's evidence records.
- Query parameters: `type` (optional), `verificationStatus` (optional), `search` (optional).

### `POST /api/evidence`
Creates an evidence record.
**Request Body:**
```json
{
  "title": "Full-Stack Web App",
  "type": "project",
  "description": "Interactive React & Node portal",
  "source": "GitHub",
  "sourceUrl": "https://github.com/...",
  "relatedSkills": ["React", "TypeScript", "Node.js"],
  "evidenceDate": "2026-08-15",
  "fileRef": null
}
```

### `GET /api/evidence/:id`
Retrieves a single evidence item. Enforces ownership (`student === req.user._id`).

### `PATCH /api/evidence/:id`
Updates permitted evidence metadata. Enforces ownership.

### `DELETE /api/evidence/:id`
Removes evidence record and deletes any attached private file from server storage. Enforces ownership.

### `POST /api/evidence/upload`
Uploads a resume or certificate document via `multipart/form-data`.
- Form field: `file`
- Optional form field: `evidenceId`
- Storage: Saved to private `/backend/uploads/` directory with a cryptographically randomized filename.

### `GET /api/evidence/:id/download`
Streams the private file to the client with `Content-Disposition: attachment`.
- Enforces strict ownership check (`student === req.user._id`).
- Returns `403 Forbidden` if another student requests the file.

---

## 4. Role Matching & Skill Analysis Endpoints

### `GET /api/roles`
Retrieves all available career role definitions and required skill benchmarks.

### `GET /api/roles/:id`
Retrieves specific role details.

### `POST /api/skill-analysis`
Executes skill gap and readiness analysis against a role ID, persists a snapshot in MongoDB `SkillAnalysis`, and updates the student's selected target role.

### `GET /api/skill-analysis/me`
Retrieves the student's latest persisted skill gap snapshot.

---

## 5. Learning & Progress Endpoints

### `GET /api/learning/resources`
Returns the learning resources catalog. Query parameters: `skill`, `difficulty`, `search`. Attaches the current student's progress status (`recommended`, `not_started`, `in_progress`, `completed`).

### `GET /api/learning/progress`
Returns student's active and completed learning progress entries.

### `POST /api/learning/progress`
Enrolls student in a resource. Body: `{ "resourceId": "...", "status": "in_progress", "progressPercentage": 10 }`.

### `PATCH /api/learning/progress/:id`
Updates course progress percentage and status transition. Enforces ownership.

---

## 6. System Health Endpoint

### `GET /api/health`
Returns system status, MongoDB connection state, and AI microservice health.
