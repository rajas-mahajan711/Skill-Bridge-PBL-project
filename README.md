# SkillBridge — Student Dashboard & Skill Development (Person 2)
### AI-Powered Skill Intelligence and Placement Platform
**PBL Final College Demonstration — Computer Engineering**

SkillBridge is an AI-powered skill intelligence and placement automation platform that consolidates student skill evidence from GitHub repositories, college assessments, projects, certifications, and internships to compute explainable, evidence-backed proficiency ratings and match students with target career roles.

This repository contains the complete **Student-Facing Interface & Skill Development Module (Person 2)**, developed following professional UI/UX reference designs from ProjectSync, a professional blue color palette, explicit typography guidelines, and zero-port VS Code launcher workflows.

---

## 1. Zero-Configuration Running Workflows (VS Code & Browser)

You do **not** need to manually memorize ports, localhost URLs, or terminal commands. Choose any of these 1-click workflows:

### Method A — Root Command (Recommended: 1-Click Auto-Open)
Open your terminal in the `PBL_Final/` project root directory and run:
```bash
npm start
```
*What happens:* Vite boots the React application and **automatically launches your default web browser** directly to the student portal.

---

### Method B — VS Code Build Task (`Ctrl + Shift + B`)
1. Open the `PBL_Final/` folder in Visual Studio Code.
2. Press `Ctrl + Shift + B` (or `Cmd + Shift + B` on macOS).
3. Select **`Start SkillBridge Student Portal (Auto-Opens Browser)`**.
*What happens:* VS Code launches the dev server and immediately opens the application in your browser.

---

### Method C — VS Code Launch / Debug (`F5`)
1. Press `F5` in Visual Studio Code.
2. Select **`Launch Student Portal in Browser`**.
*What happens:* Launches the student portal with active debugging attached.

---

### Method D — VS Code Live Server Extension
1. Right-click [`index.html`](file:///c:/Users/Aamrapali/OneDrive/Desktop/PBL_Final/index.html) in the root folder of VS Code.
2. Select **"Open with Live Server"**.
*What happens:* A high-visibility launcher page opens in your browser with direct links to the live dev server and the pre-compiled offline production build (`frontend/dist/index.html`).

---

### Method E — Full-Stack Mode (With Backend & AI Microservice)
If you want to run the full stack with live MongoDB and the Python FastAPI microservice:

#### 1. Start Python AI Microservice (Terminal 1)
```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Start Express REST API Backend (Terminal 2)
```powershell
cd backend
npm run dev
```

#### 3. Start React Frontend (Terminal 3)
```powershell
cd frontend
npm run dev
```

> [!NOTE]
> **Offline / Standalone Resilience:** If MongoDB or the Python backend is not running, the student portal automatically activates **Demo Mode**. It pre-loads an audited academic portfolio for student **Aamrapali More** with 10 skills, 7 evidence items, role definitions, and course recommendations, persisting all profile edits and evidence submissions locally in `localStorage`.

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router DOM v6, Axios, Lucide React, React Hook Form.
- **Backend Integration**: Node.js, Express.js REST API, Mongoose ODM, Helmet, CORS, Multer (Secure Private Storage).
- **AI/ML Integration**: Python 3.14, FastAPI, Pydantic v2, Uvicorn, Pytest.
- **Authentication**: JWT (JSON Web Tokens), bcryptjs password hashing, role-based route protection, instant demo fallback.

---

## 3. Design System & Typography Rules

The student interface follows a **Professional Blue Theme** inspired by the ProjectSync UI/UX reference screenshots:

### Color Palette
- **Primary Blue**: `#2563EB` (Primary brand buttons, focus states, key badges)
- **Dark Navy**: `#172554` / `#0F172A` (Sidebar background, top brand headers)
- **Secondary Blue**: `#3B82F6` (Accents, active pills, secondary badges)
- **Light Blue Background**: `#EFF6FF` (Subtle card highlights, active tab states)
- **Main Page Background**: `#F5F8FC` (App content canvas)
- **Card Background**: `#FFFFFF` (High contrast, subtle borders)
- **Main Text**: `#1E293B` (Primary headings and high-contrast text)
- **Secondary Text**: `#64748B` (Subtitles, meta labels, timestamps)
- **Border**: `#E2E8F0` (Card and table separators)
- **Status Colors**: Success `#15803D`, Warning `#D97706`, Error `#DC2626`

### Typography Hierarchy (Defined in `index.css`)
- **Body & Main Interface**: `Arial, sans-serif`
- **Navigation, Buttons, Labels, Inputs**: `Helvetica, Arial, sans-serif`
- **Featured Editorial Headings**: `Times New Roman, serif` (used purposefully on featured banners and quotes)

---

## 4. Student Portal Pages & Routes

All 8 student routes are fully implemented and navigable from the sidebar:

| Route | Page Name | Visual Reference Match | Key Features |
|---|---|---|---|
| `/student/dashboard` | **Student Dashboard** | ProjectSync Dashboard | 4 summary metric cards, skills preview by category, target career explorer, recommended next actions, activity feed. |
| `/student/profile` | **My Profile** | Student Profile Form | Pre-filled academic info, department, CGPA, target role selector, GitHub/LinkedIn/LeetCode links, required/optional indicators. |
| `/student/skills` | **My Skills** | `Skill_competency.jpg` | Overview/Hard/Soft skill tabs, competency levels, evidence breakdown (certificates, projects, courses), verification standards guide, detail modal. |
| `/student/evidence` | **Skill Evidence** | Evidence Repository | 3 summary cards, multi-type filter tabs, modal with file upload (PDF/DOCX/PNG max 5MB), secure authenticated download. |
| `/student/skill-gap` | **Skill Gap Analysis** | Gap Analysis Engine | Role selector, 4 summary cards, dual-bar skill comparison table, gap severity badges, direct course links. |
| `/student/recommendations` | **Learning Resources** | `skill_courses.png` | 4 metric cards (Courses, Gaps Addressed, Certificates, Time), course cards with progress sliders, "Your Skill Gaps" sidebar, Quick Learning Paths. |
| `/student/progress` | **Overall Readiness** | `overall_readiness.png` | 72% readiness circular SVG gauge, multi-attribute stat cards, dual-bar skill comparison, SVG radar chart, key insights, action checklist. |
| `/student/roles` | **Job Role Matching** | `job_roll_matching.png` | 78% SDE match circular SVG gauge, role requirements table, breakdown of matching/weak/missing skills, other candidate career matches list. |

---

## 5. Verification & Test Results

All test suites pass 100% with zero errors:

```powershell
# 1. Frontend Unit Tests (6 passed)
cd frontend
npm test

# 2. Frontend Production Build (Zero TypeScript errors)
cd frontend
npm run build

# 3. Express REST API Integration Tests (11 passed)
cd backend
npm test

# 4. FastAPI AI Microservice Pytests (6 passed)
cd ai-service
pytest tests/
```

---

## 6. Shared Architecture Coordination (Handoff to Team)

### For Person 1 (Shared Layout, Auth & Design Tokens):
- **Authentication**: JWT bearer token format in `Authorization: Bearer <token>` header (`{ id, role: "student" }`). Person 1's global auth routes (`/auth/login`, `/auth/register`, `/auth/me`) are fully adhered to by `authService.ts`.
- **User & StudentProfile Models**: Clean Mongoose models with separation between account credentials (`User`) and academic portfolio (`StudentProfile`).
- **Layout Compatibility**: The student experience is encapsulated in `StudentLayout.tsx`. If Person 1 introduces a global shell, `StudentLayout.tsx` can simply delegate to Person 1's component without breaking any student routes.

### For Person 5 (Full-Stack Integration & Testing):
- **API Client**: Located at `frontend/src/services/api.ts` with automatic token injection.
- **Deterministic AI Fallback**: If the Python FastAPI service is offline, the Node backend computes deterministic role readiness scores to ensure uninterrupted demonstration.
- **Client Offline Fallback**: All frontend services (`studentService`, `evidenceService`, `skillService`, `learningService`, `authService`) fall back cleanly to `mockData.ts` with local storage persistence.

---

## 7. Folder Structure

```
PBL_Final/
|-- .vscode/
|   |-- launch.json             # F5 browser launcher configuration
|   |-- tasks.json              # Ctrl+Shift+B zero-port build and run tasks
|-- index.html                  # Live Server launcher dashboard (links to dev or dist)
|-- package.json                # Root package with "npm start" and "npm run dev"
|
|-- frontend/                   # React + TypeScript + Vite + Tailwind CSS
|   |-- dist/                   # Pre-compiled production bundle (zero TS errors)
|   |-- src/
|   |   |-- app/                # App entrypoint & router.tsx (all 8 student routes)
|   |   |-- components/
|   |   |   |-- layout/         # Sidebar.tsx, TopNavbar.tsx, StudentLayout.tsx
|   |   |   |-- ui/             # Button, Badge, Card, Modal, Input, ProgressBar, Skeleton
|   |   |-- features/
|   |   |   |-- auth/           # LoginPage.tsx, RegisterPage.tsx (blue theme, 1-click demo access)
|   |   |   |-- student-dashboard/  # DashboardPage.tsx + 4 widgets
|   |   |   |-- student-profile/    # ProfilePage.tsx (full edit form)
|   |   |   |-- skills/             # SkillsPage.tsx (matches Skill_competency.jpg)
|   |   |   |-- skill-evidence/     # EvidencePage.tsx + AddEvidenceModal.tsx
|   |   |   |-- skill-gap/          # SkillGapPage.tsx (role comparison & explanations)
|   |   |   |-- learning/           # LearningPage.tsx (matches skill_courses.png)
|   |   |   |-- progress/           # ProgressPage.tsx (matches overall_readiness.png)
|   |   |   |-- roles/              # JobRoleMatchingPage.tsx (matches job_roll_matching.png)
|   |   |-- services/           # studentService, evidenceService, skillService, learningService, authService, mockData
|   |   |-- types/              # TypeScript schemas for skills, evidence, profile, user, learning, role
|   |   |-- test/               # Vitest unit test suite (100% pass)
|   |-- tailwind.config.js      # Blue color palette & typography tokens
|   |-- vite.config.ts          # open: true, base: './' for zero-port Live Server support
|
|-- backend/                    # Express.js REST API Backend
|-- ai-service/                 # Python FastAPI AI Microservice
|-- docs/screenshots/           # Original ProjectSync UI/UX reference images
```
