# SkillBridge Architecture & Technical Design - Member 4
**Component:** Faculty / T&P & Recruiter Workstream  
**Scope:** Batch Analytics, Job Requisition Builder, Explainable Candidate Ranking, Shortlisting, and RBAC Safeguards  

---

## 1. System Context & Workstream Interfaces
Member 4 bridges academic career services and external corporate hiring:

```
┌────────────────────────────────────────────────────────┐
│             Person 1: App Shell & RBAC                │
│             Headers: X-User-Role / JWT                 │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌─────────────────────────┐       ┌─────────────────────────┐
│     FACULTY / T&P       │       │   RECRUITER / COMPANY   │
│       WORKSTREAM        │       │       WORKSTREAM        │
│ • Batch Skill Dist.     │       │ • Job Description Spec  │
│ • Common Skill Gaps     │       │ • Explainable Ranking   │
│ • Training Progress     │       │ • Shortlist Actions     │
│ • Safe Report Export    │       │ • Privacy Consent Guard │
└──────────┬──────────────┘       └──────────┬──────────────┘
           │                                 │
           └─────────────────┬───────────────┘
                             ▼
┌────────────────────────────────────────────────────────┐
│            Person 3: AI/ML Service Endpoints           │
│   Skill Extraction, Weighted Evidence & Confidence     │
└────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) & Privacy Guard
The platform enforces strict role boundaries:

| Resource / Capability | Faculty / T&P Role | Recruiter / Company Role | Enforcement Mechanism |
| :--- | :---: | :---: | :--- |
| **Batch Skill Analytics** | ✅ Read Full | ❌ Blocked (403) | `verify_role_access(role, ["faculty_tp"])` |
| **Student Roll No / Academic Name**| ✅ Visible | ❌ Masked to Alias | Data Sanitization Pipeline |
| **Multi-Source Evidence** | ✅ Full Evidence | ⚠️ Consented Only | Privacy Filter & Consent Check |
| **Remedial Training Progress** | ✅ Full Cohort | ❌ Blocked | Attribute Exclusion |
| **Post / Edit Job Description** | ❌ Blocked | ✅ Full Requisition | `verify_role_access(role, ["recruiter"])` |
| **Ranked Candidates** | ❌ Recruiter Only | ✅ Explainable Score | Candidate Matching Engine |
| **Shortlist & Stage Pipeline** | ❌ Recruiter Only | ✅ Read/Write | Persistent Shortlist Store |

### Candidate Placement Consent Guard
In accordance with Section 17 (*Security, Privacy & Fairness*):
1. **Consent Opt-In Verification:** Candidates who have not opted in (`consented_placement == False`) are completely invisible to the recruiter ranking engine.
2. **Direct Probe Prevention:** Attempting to query `GET /api/v1/recruiter/candidates/{id}` on a non-consented candidate returns `403 Forbidden` with a clear explanation.
3. **Anonymization / Bias Prevention:** Recruiters initially view candidate aliases (`Candidate CS-01`). Sensitive personal attributes such as gender, caste, religion, age, and familial status are strictly omitted from matching models and UI presentations.

---

## 3. Explainable Candidate Matching Algorithm
Candidate ranking avoids "blackbox AI" and implements transparent, multi-factor matching:

$$\text{ReqEarned} = \sum_{r \in \text{Req}_{\text{met}}} \text{Weight}_r, \quad \text{TotalReq} = \sum_{r \in \text{Req}} \text{Weight}_r$$

$$\text{BaseScore} = \left(\frac{\text{ReqEarned}}{\text{TotalReq}}\right) \times 85.0$$

$$\text{MatchScore} = \min(99.0, \max(20.0, \text{BaseScore} + \text{Bonus}_{\text{preferred}} + \text{ReadinessFactor}))$$

### Natural Language Explainability Output
Every candidate match generates an explainable textual breakdown for recruiters:
> *"Candidate meets 4 of 5 job requirements with overall readiness score of 84.5%. Strong evidence verified in: Python (88/100), SQL (82/100). Primary shortfall observed in: Docker (-2.0 pts). High project & assessment evidence."*

---

## 4. Batch Analytics & Gap Formulation
1. **Skill Distribution:** Synthesized across four standard domains (Backend, Frontend, DevOps/Cloud, Foundational).
2. **Benchmark Comparison:** Baseline readiness standard $B = 75.0\%$.
3. **Skill Gap Priority:**
   - $\text{Gap} > 20.0 \implies \textbf{Critical Priority}$ (Immediate faculty-led intervention required)
   - $10.0 < \text{Gap} \le 20.0 \implies \textbf{Moderate Priority}$
   - $\text{Gap} \le 10.0 \implies \textbf{Low Priority}$
