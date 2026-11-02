# SkillBridge — AI-Powered Student Skill Intelligence & Placement Platform

> **Five Coordinated Workstreams • Shared Architecture • Integration-Ready Modules**  
> Integrated by **Person 5 (Integration Lead & QA Engineer)**

---

## 1. System Overview

SkillBridge consolidates verifiable evidence from GitHub repositories, coding platforms (LeetCode/HackerRank), resumes, college lab assessments, and internship records into an evidence-backed skill score. It provides role-readiness matching and distinct portals for **Students**, **Faculty / T&P Officers**, **Recruiters**, and **Platform Administrators**.

### Architecture Stack
- **Frontend Client**: React 18 + Tailwind CSS + Lucide Icons (Port `5173`)
- **Backend API Gateway**: Node.js + Express REST API (Port `5000`, Prefix: `/api/v1`)
- **Database Layer**: MongoDB with Mongoose ODM (Replaces proposal's PostgreSQL for college-wide integration)
- **AI/ML Microservice**: Python 3 + FastAPI (Port `8000`)

---

## 2. Directory Structure

```
skillbridge/
├── frontend/                   # React + Tailwind app
│   ├── src/
│   │   ├── components/         # Shared UI (ProjectSync style tokens)
│   │   ├── layouts/            # AppLayout with responsive sidebar & topbar
│   │   ├── pages/
│   │   │   ├── admin/          # Person 5 Admin Console (Dashboard, Users, Integrations, Audit)
│   │   │   ├── student/        # Person 2 Student Experience (Placeholder/Contract)
│   │   │   ├── faculty/        # Person 4 Faculty/T&P Portal (Placeholder/Contract)
│   │   │   └── recruiter/      # Person 4 Recruiter Hub (Placeholder/Contract)
│   │   ├── services/           # Shared API clients & AdminService
│   │   └── App.jsx             # Master navigation & role coordinator
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                    # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Centralized environment configuration
│   │   ├── controllers/        # AdminController & business logic
│   │   ├── middleware/         # Auth, Role-based access control (RBAC), error handling
│   │   ├── models/             # User, AuditLog, SystemMetric Mongoose abstractions
│   │   ├── routes/             # Admin REST route definitions (/api/v1/admin/*)
│   │   ├── services/           # FastAPI AI client & connector probes
│   │   ├── validators/         # Input validation schemas
│   │   ├── app.js              # Application router & CORS gateway
│   │   └── server.js           # Express/Node HTTP server entry
│   ├── tests/                  # Automated integration tests (node:test)
│   └── package.json
├── ai-service/                 # Python 3 + FastAPI microservice
│   ├── app/
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   └── main.py             # FastAPI service & fallback health probe
│   └── requirements.txt
├── docs/                       # Integration standards & contracts
│   ├── API_CONTRACTS.md        # Comprehensive endpoint mapping
│   ├── INTEGRATION_CONTRACT.md # Shared architecture & privacy standards
│   └── INTEGRATION_REPORT.md   # Final QA report & test logs
├── .env.example                # Template for environment configuration
├── .gitignore                  # Git exclusion rules
└── README.md                   # Platform documentation
```

---

## 3. Quickstart & Setup Guide

### Prerequisites
- Node.js (v18+ or v24+)
- Python 3.10+ (for AI microservice)
- MongoDB (Optional for dev/test: built-in in-memory fallback enables zero-setup execution)

### 1. Environment Configuration
Copy `.env.example` to `backend/.env` (or configure root environment):
```bash
cp .env.example backend/.env
```

### 2. Running the Backend API Gateway (Port 5000)
```bash
cd backend
node src/server.js
```
The server will start at `http://localhost:5000/api/v1`.  
Health check: `http://localhost:5000/api/v1/health`.

### 3. Running Backend Automated Tests
Execute the automated test suite verifying RBAC, sanitization, user status updates, and audit logging:
```bash
node --test backend/tests/admin.test.js
```
*Output: 10/10 tests passing.*

### 4. Running the Python AI Microservice (Port 8000)
```bash
cd ai-service
# With FastAPI installed:
uvicorn app.main:app --port 8000 --reload
# Or with standard Python:
python app/main.py
```

### 5. Running the Frontend (Port 5173)
```bash
cd frontend
npm run dev
```

---

## 4. Role Accounts & Demo Authentication

The API gateway enforces role permissions on the backend. For testing and demonstration, pre-configured tokens can be passed via the `Authorization: Bearer <TOKEN>` header:

| Role | Demo Header Token | Access Scope |
|------|-------------------|--------------|
| **Admin** | `Bearer mock-admin-token` | Full Admin Console, user management, audit logs, system telemetry |
| **Student** | `Bearer mock-student-token` | Student workspace, skill evidence, gaps & recommendations |
| **Faculty** | `Bearer mock-faculty-token` | Batch analytics, cohort readiness distribution |
| **Recruiter** | `Bearer mock-recruiter-token` | Job description creation, candidate ranking |

---

## 5. Security & Privacy Guarantees

1. **Strict Password Sanitization**: Passwords, password hashes, and session secrets are permanently stripped from all admin API responses (`select('-password')`).
2. **Consent-Based Student Discovery**: Recruiters can only access candidates who have explicitly opted-in (`consentGiven: true`).
3. **No Sensitive Attributes in Ranking**: Ranking and fit algorithms reject sensitive attributes (gender, race, age, religion).
4. **Transparent Connector Status**: Any external integration without verified production credentials is explicitly labelled as `DEMO SANDBOX`.
