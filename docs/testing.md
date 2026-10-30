# SkillBridge Testing & Verification Report
**Test Suites and Quality Assurance for Student Module (Person 2)**

## 1. Test Suite Summary

| Test Domain | Framework | Target Scope | Tests Count | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Vitest + RTL | UI Components, Buttons, Badges, Progress, Protected Route Auth Guard | 6 passed | **100% PASS** |
| **Frontend Build** | TypeScript + Vite | Static Type Checking & Production Build Asset Generation | 1,681 modules | **100% PASS** |
| **Backend REST API** | Jest + Supertest | Health Checks, Auth Enforcement, Input Validation, Upload Validation | 11 passed | **100% PASS** |
| **AI/ML Service** | Pytest + TestClient | Health, Evidence Scoring, Confidence Metrics, Skill Gaps, Role Matching, Resume Extraction | 6 passed | **100% PASS** |

---

## 2. Test Execution Details

### A. AI/ML Microservice Tests (`ai-service/`)
**Command:**
```powershell
python -m pytest tests/
```
**Verification Scope:**
- `test_health_endpoint`: Validates microservice status and operational headers.
- `test_analyze_skills_insufficient_evidence`: Ensures missing evidence correctly returns `score: null` and `status: "insufficient_evidence"`.
- `test_analyze_skills_with_verified_evidence`: Validates multi-source evidence weighting, verification multipliers, and confidence scoring.
- `test_skill_gap_analysis`: Validates gap breakdown into `meeting`, `weak`, and `missing` with threshold calculations.
- `test_role_matching`: Ensures career roles are ranked correctly by candidate alignment.
- `test_resume_extraction`: Confirms candidate keywords are extracted from text with the unverified disclaimer.

**Result:**
```
============================= test session starts =============================
platform win32 -- Python 3.14.7, pytest-9.1.1, pluggy-1.7.0
rootdir: C:\Users\Aamrapali\OneDrive\Desktop\PBL\ai-service
collected 6 items

tests\test_analysis.py ......                                            [100%]
======================== 6 passed, 1 warning in 0.84s =========================
```

---

### B. Express Backend REST API Tests (`backend/`)
**Command:**
```powershell
npm test
```
**Verification Scope:**
- `GET /api/health`: Health status and database connectivity.
- `404 Handler`: Validates that undefined endpoints return structured JSON 404 responses.
- `Route Guards`: Verifies that unauthorized requests to `/api/students/me`, `/api/students/me/dashboard`, `/api/evidence`, and `/api/learning/resources` return `401 Unauthorized`.
- `Validation Checks`: Validates required fields on `/api/auth/register` and `/api/auth/login`.
- `Upload Route Protection`: Verifies that unauthorized file uploads are blocked before reaching Multer storage.

**Result:**
```
PASS tests/api.test.js
  SkillBridge Backend REST API Tests
    System & Health API
      √ GET /api/health should return system status (112 ms)
      √ GET /api/nonexistent should return 404 (28 ms)
    Authentication Enforcement on Protected Routes
      √ GET /api/students/me without token should return 401 Unauthorized (30 ms)
      √ GET /api/students/me/dashboard without token should return 401 (21 ms)
      √ GET /api/evidence without token should return 401 (22 ms)
      √ POST /api/evidence without token should return 401 (31 ms)
      √ GET /api/learning/resources without token should return 401 (14 ms)
    Authentication Input Validation
      √ POST /api/auth/register should fail when required fields are missing (19 ms)
      √ POST /api/auth/login should fail with missing credentials (18 ms)
      √ POST /api/auth/login with invalid email should return 401 or 503 if DB offline (17 ms)
    Upload File Size & Type Validation
      √ POST /api/evidence/upload without token should return 401 (27 ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
Time:        2.279 s
```

---

### C. React Frontend Tests (`frontend/`)
**Command:**
```powershell
npm test
```
**Verification Scope:**
- UI components: `Button`, `Badge`, `Card`, and `ProgressBar` rendering and variant styles.
- ARIA accessibility: `progressbar` role and `aria-valuenow` attributes.
- `ProtectedRoute`: Verifies that unauthorized access is redirected while active student sessions are rendered.

**Result:**
```
 ✓ src/test/auth.test.tsx (2 tests) 49ms
 ✓ src/test/components.test.tsx (4 tests) 97ms

 Test Files  2 passed (2)
      Tests  6 passed (6)
   Duration  5.31s
```

---

### D. Production Build Verification
**Command:**
```powershell
npm run build
```
**Result:**
```
vite v6.4.5 building for production...
transforming...
✓ 1681 modules transformed.
rendering chunks...
dist/index.html                   0.86 kB │ gzip:   0.48 kB
dist/assets/index-ICCAJezQ.css   31.16 kB │ gzip:   6.00 kB
dist/assets/index-DQq0Ptuk.js   395.75 kB │ gzip: 123.91 kB
✓ built in 5.12s
```
