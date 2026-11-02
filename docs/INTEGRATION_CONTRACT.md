# SkillBridge Integration Contract & Architecture Standard
**Version**: 1.0.0  
**Integration Lead**: Person 5 (Admin & Integration Lead / QA Engineer)  
**Status**: APPROVED & ACTIVE FOR SPRINT MERGE  

---

## 1. System Architecture Overview

SkillBridge adopts a 4-tier decoupled micro-architecture:
1. **Frontend Client**: React 18 + Tailwind CSS + Lucide Icons (Vite build)
2. **Core API Gateway & Application Server**: Node.js + Express REST API (prefix: `/api/v1`)
3. **Primary Database**: MongoDB with Mongoose ODM (Replaces proposal's PostgreSQL for college-wide schema flexibility)
4. **AI/ML Service**: Python 3 + FastAPI stateless intelligence microservice (called synchronously by Express)

```
[ React Client (Port 5173) ]
           │
           ▼ (REST over HTTP, Bearer JWT)
[ Express API Gateway (Port 5000) ] ◄──► [ MongoDB Database (Port 27017) ]
           │
           ▼ (Internal REST, Service Timeout: 8000ms)
[ FastAPI AI/ML Service (Port 8000) ]
```

---

## 2. Role-Based Access Control (RBAC) Contract

Four distinct roles are enforced strictly on the backend:

| Role Identifier | Description | Permitted Workflows | Restricted Data |
|-----------------|-------------|---------------------|-----------------|
| `student` | Enrolled student candidate | View profile, upload evidence, view skill scores, view gaps & learning paths | Cannot view other students, college metrics, recruiter shortlist |
| `faculty` | Faculty / T&P Officer | Batch skill analytics, readiness distribution, student academic verification | Cannot modify admin settings or create recruiter jobs |
| `recruiter` | Company / Hiring partner | Post job descriptions, view ranked candidates, shortlist candidates | Cannot view sensitive personal data, contact info without consent |
| `admin` | Platform Administrator | Full platform oversight, user management, integration monitor, audit logs | Cannot view plaintext passwords or private uploaded evidence |

Backend RBAC is enforced via:
- `authMiddleware.js`: Validates JWT Bearer token, populates `req.user`.
- `roleMiddleware.js`: Checks `req.user.role === expectedRole` (or array of permitted roles).

---

## 3. Uniform API Envelope Specification

All Express REST API endpoints MUST return JSON matching this envelope:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-24T08:50:00.000Z",
    "requestId": "req-1729759800"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | INTERNAL_ERROR",
    "message": "Human-readable explanation",
    "details": null
  }
}
```

---

## 4. UI/UX Reference Design Tokens (ProjectSync Style)

To ensure visual harmony without five different design systems:

- **Primary Accent**: Teal / Turquoise (`#0EA5A4`, `hsl(179, 84%, 35%)`)
- **Brand Navy**: `#0B1F3A` (Dark sidebar & branding)
- **Indigo Accent**: `#4F46E5` (Secondary action)
- **Backgrounds**: Slate 50 (`#F8FAFC`), White cards (`#FFFFFF`)
- **Cards**: `rounded-2xl`, subtle border `border-slate-200`, light shadow `shadow-sm`
- **Typography**: Inter / sans-serif, high-contrast ink (`#0F172A`), muted captions (`#64748B`)
- **Status Badges**:
  - `active` / `healthy` / `high`: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - `pending` / `warning` / `medium`: Amber (`bg-amber-50 text-amber-700 border-amber-200`)
  - `inactive` / `error` / `critical`: Rose (`bg-rose-50 text-rose-700 border-rose-200`)
  - `demo` / `mock`: Purple (`bg-purple-50 text-purple-700 border-purple-200`)

---

## 5. Privacy, Security & AI Explainability Rules

1. **Student Consent**: External profile linking (GitHub, LeetCode) and recruiter visibility requires explicit opt-in (`consentGiven: true`).
2. **Zero Sensitive Attributes**: Candidate ranking algorithms MUST NOT accept or use gender, race, age, religion, or physical address.
3. **Explainable Matches**: Any candidate match or gap score MUST return an `explanation` array with contributing skills and evidence sources.
4. **No Secrets In Admin UI**: Passwords, password hashes, JWT secrets, and raw authentication tokens are excluded from all API responses (`select('-password')`).
5. **Connector Transparency**: If an external platform (e.g. GitHub API, LeetCode API, College LMS) is not connected with live production keys, it MUST be explicitly flagged as `MODE: DEMO` in the integration monitor. Never claim mock data is live.

---

## 6. Workstream Handoff Checklist

- [x] Person 1: Foundation & Auth (Express user model, JWT token generation, shared layout shell)
- [ ] Person 2: Student Experience (Dashboard, evidence upload, skill gap visualizer)
- [ ] Person 3: AI/ML Service (FastAPI stateless endpoints: `/extract`, `/score`, `/rank`, `/gaps`)
- [ ] Person 4: Faculty/T&P & Recruiter Portal (Batch analytics, JD parsing, candidate ranking)
- [x] Person 5: Admin Console, Integration Lead & QA (Admin dashboard, user management, integration health, audit logs, end-to-end tests)
