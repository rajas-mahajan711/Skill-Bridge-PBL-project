# SkillBridge API Contracts Specification
**API Version**: `/api/v1`  
**Host (Default)**: `http://localhost:5000` (Express Backend)  
**AI Microservice**: `http://localhost:8000` (FastAPI Microservice)  

---

## 1. System Health & Infrastructure (Person 5)

### `GET /api/v1/health`
Checks server vitality and returns current node process status.
- **Role**: Public
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "uptime": 1420.5,
    "timestamp": "2026-10-24T08:50:00.000Z",
    "environment": "development",
    "version": "1.0.0"
  }
}
```

---

## 2. Admin Console Endpoints (Person 5 Ownership)

All Admin routes require HTTP Header: `Authorization: Bearer <JWT_TOKEN>` with `role: "admin"`.

### `GET /api/v1/admin/overview`
Retrieves platform-wide aggregated metrics, health summary, and verification stats.
- **Role**: `admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalStudents": 1240,
      "totalFaculty": 48,
      "totalRecruiters": 35,
      "totalAdmins": 4,
      "verifiedSkillsCount": 3820,
      "averagePlacementReadiness": 81.4,
      "aiJobsCompletedToday": 342,
      "pendingVerifications": 19
    },
    "systemHealth": {
      "database": "connected",
      "aiService": "healthy",
      "storage": "operational",
      "uptimeSeconds": 86400
    },
    "placementBreakdown": {
      "ready": 650,
      "inProgress": 470,
      "needsSupport": 120
    }
  }
}
```

### `GET /api/v1/admin/users`
Lists registered users with pagination, role filtering, search, and status.
- **Role**: `admin`
- **Query Params**:
  - `role`: (Optional) `student` | `faculty` | `recruiter` | `admin`
  - `status`: (Optional) `active` | `inactive`
  - `search`: (Optional) string (name or email)
  - `page`: (Optional, default: 1)
  - `limit`: (Optional, default: 20)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "usr_6719b01",
        "name": "Aarav Sharma",
        "email": "aarav.sharma@college.edu",
        "role": "student",
        "status": "active",
        "department": "Computer Science & Engineering",
        "batch": "2027",
        "consentGiven": true,
        "createdAt": "2026-09-01T10:00:00.000Z",
        "lastLogin": "2026-10-24T07:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 1327,
      "page": 1,
      "limit": 20,
      "totalPages": 67
    }
  }
}
```

### `GET /api/v1/admin/users/:id`
Retrieves detailed profile metadata for a specific user without leaking passwords/tokens.
- **Role**: `admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "usr_6719b01",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@college.edu",
    "role": "student",
    "status": "active",
    "department": "Computer Science & Engineering",
    "batch": "2027",
    "consentGiven": true,
    "verifiedSkillsCount": 14,
    "lastAuditActivity": "Profile updated",
    "createdAt": "2026-09-01T10:00:00.000Z"
  }
}
```

### `PATCH /api/v1/admin/users/:id/status`
Toggles active or inactive status for a user and registers an audit log entry.
- **Role**: `admin`
- **Request Body**:
```json
{
  "status": "inactive",
  "reason": "Administrative suspension pending document verification"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "usr_6719b01",
    "status": "inactive",
    "updatedAt": "2026-10-24T08:52:00.000Z",
    "auditLogged": true
  }
}
```

### `PATCH /api/v1/admin/users/:id/role`
Changes a user's role with administrative authorization check.
- **Role**: `admin`
- **Request Body**:
```json
{
  "role": "faculty",
  "department": "Computer Science"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "usr_6719b01",
    "role": "faculty",
    "updatedAt": "2026-10-24T08:53:00.000Z"
  }
}
```

### `GET /api/v1/admin/integrations`
Retrieves live connectivity status of the microservices and connectors.
- **Role**: `admin`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "name": "MongoDB Primary Database",
        "type": "database",
        "status": "connected",
        "mode": "live",
        "latencyMs": 4,
        "endpoint": "mongodb://localhost:27017/skillbridge"
      },
      {
        "name": "FastAPI AI/ML Service",
        "type": "ai_microservice",
        "status": "healthy",
        "mode": "live",
        "latencyMs": 28,
        "endpoint": "http://localhost:8000/health"
      },
      {
        "name": "GitHub Evidence Sync Connector",
        "type": "external_connector",
        "status": "configured",
        "mode": "demo",
        "notes": "Simulated sandbox adapter active for test credentials"
      },
      {
        "name": "College LMS / Assessment Ingestion",
        "type": "erp_connector",
        "status": "configured",
        "mode": "demo",
        "notes": "CSV & mock webhook bridge enabled"
      }
    ]
  }
}
```

### `GET /api/v1/admin/audit-logs`
Retrieves immutable administrative audit trail logs.
- **Role**: `admin`
- **Query Params**: `limit` (default: 50), `severity` (info|warning|critical)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "log_89211",
        "timestamp": "2026-10-24T08:45:12.000Z",
        "actor": { "id": "adm_1", "name": "System Administrator", "role": "admin" },
        "action": "USER_STATUS_UPDATE",
        "target": { "type": "user", "id": "usr_6719b01" },
        "severity": "warning",
        "details": "User status changed to inactive",
        "ipAddress": "127.0.0.1"
      }
    ]
  }
}
```

---

## 3. Workstream Interfaces for Persons 1–4

### Authentication & Foundation (Person 1)
- `POST /api/v1/auth/register` (body: name, email, password, role)
- `POST /api/v1/auth/login` (body: email, password -> returns `{ token, user }`)
- `GET /api/v1/auth/me` (requires Bearer token)

### Student Experience (Person 2)
- `GET /api/v1/student/profile`
- `POST /api/v1/student/evidence` (upload or link project/cert)
- `GET /api/v1/student/skills`
- `GET /api/v1/student/gaps`
- `GET /api/v1/student/learning-paths`

### AI/ML Intelligence Service (Person 3 - FastAPI on :8000)
- `GET /health`
- `POST /api/v1/skills/extract`
- `POST /api/v1/skills/score`
- `POST /api/v1/matches/rank`
- `POST /api/v1/gaps/analyze`

### Faculty & Recruiter (Person 4)
- `GET /api/v1/faculty/analytics`
- `GET /api/v1/faculty/students`
- `POST /api/v1/recruiter/jobs`
- `GET /api/v1/recruiter/jobs/:id/candidates`
- `POST /api/v1/recruiter/shortlist`
