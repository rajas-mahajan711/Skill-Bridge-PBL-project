/**
 * SkillBridge - Member 4 Frontend Application Engine
 * Faculty / T&P & Recruiter Workstream
 */

const API_BASE = "http://127.0.0.1:8000/api/v1";

// Application State
const state = {
  currentRole: "faculty_tp", // 'faculty_tp' or 'recruiter'
  currentView: "faculty-analytics", // active route
  filters: {
    department: "All",
    batch: "All",
    target_role: "All",
    skill: "All"
  },
  analyticsData: null,
  studentsList: [],
  trainingData: null,
  jobsList: [],
  selectedJobId: "JOB-2026-01",
  rankedCandidates: null,
  shortlistedCandidates: [],
  activeStudentDetail: null,
  activeCandidateDetail: null,
  loading: false,
  error: null,
  apiConnected: false
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  initRoleButtons();
  initNavigation();
  checkApiHealth();
  loadCurrentViewData();
});

// --- Role Switching & Navigation ---
function setRole(newRole) {
  state.currentRole = newRole;
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.role === newRole);
  });

  const rolePill = document.getElementById("active-role-pill");
  if (rolePill) {
    rolePill.className = `role-pill ${newRole === "faculty_tp" ? "faculty" : "recruiter"}`;
    rolePill.innerHTML = `<span class="status-dot"></span> ${newRole === "faculty_tp" ? "Faculty / T&P Portal" : "Recruiter Portal"}`;
  }

  // Update visible navigation links
  document.querySelectorAll(".nav-faculty").forEach(el => el.style.display = newRole === "faculty_tp" ? "flex" : "none");
  document.querySelectorAll(".nav-recruiter").forEach(el => el.style.display = newRole === "recruiter" ? "flex" : "none");

  // Route to default view for role
  if (newRole === "faculty_tp") {
    navigateTo("faculty-analytics");
  } else {
    navigateTo("recruiter-jobs");
  }
}

function initRoleButtons() {
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => setRole(btn.dataset.role));
  });
}

function initNavigation() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetView = item.dataset.view;
      if (targetView) navigateTo(targetView);
    });
  });
}

function navigateTo(viewName) {
  // Enforce Route Protection
  if (state.currentRole === "faculty_tp" && viewName.startsWith("recruiter-")) {
    alert("Role Violation: Switch to Recruiter Role to access this view.");
    return;
  }
  if (state.currentRole === "recruiter" && viewName.startsWith("faculty-")) {
    alert("Role Violation: Switch to Faculty / T&P Role to access this view.");
    return;
  }

  state.currentView = viewName;
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.view === viewName);
  });

  // Update Page Title
  const titleMap = {
    "faculty-analytics": "Batch Skill Analytics & Distribution",
    "faculty-students": "Student Readiness & Assessment Dossier",
    "faculty-training": "Training Cohort Progress & Improvement",
    "faculty-reports": "Readiness Reports & Safe Data Export",
    "recruiter-jobs": "Job Requisitions & Requirements",
    "recruiter-ranking": "AI Candidate Match & Explainable Ranking",
    "recruiter-shortlist": "Shortlisted Candidates & Review Stages"
  };
  const titleEl = document.getElementById("page-title-text");
  if (titleEl) titleEl.innerText = titleMap[viewName] || "Dashboard";

  loadCurrentViewData();
}

// --- API Helpers with Resilient Fallback ---
async function apiRequest(endpoint, method = "GET", body = null) {
  const headers = {
    "Content-Type": "application/json",
    "X-User-Role": state.currentRole
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null
    });
    const data = await res.json();
    state.apiConnected = true;
    updateApiStatus(true);
    return data;
  } catch (err) {
    console.warn("API Server unavailable, falling back to embedded isolated mock:", err);
    state.apiConnected = false;
    updateApiStatus(false);
    return fallbackLocalHandler(endpoint, method, body);
  }
}

async function checkApiHealth() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/health");
    if (res.ok) {
      state.apiConnected = true;
      updateApiStatus(true);
    }
  } catch (e) {
    state.apiConnected = false;
    updateApiStatus(false);
  }
}

function updateApiStatus(connected) {
  const el = document.getElementById("api-status-badge");
  if (el) {
    if (connected) {
      el.innerHTML = '<span class="status-dot" style="background:#10b981;"></span> Live Backend API Connected';
      el.style.borderColor = "#6ee7b7";
      el.style.background = "#ecfdf5";
      el.style.color = "#047857";
    } else {
      el.innerHTML = '<span class="status-dot" style="background:#f59e0b;"></span> Local Isolated Mock Mode';
      el.style.borderColor = "#fde68a";
      el.style.background = "#fffbeb";
      el.style.color = "#b45309";
    }
  }
}

// --- Data Loaders ---
async function loadCurrentViewData() {
  const container = document.getElementById("main-content-area");
  container.innerHTML = `
    <div class="empty-state">
      <div class="loading-spinner"></div>
      <p style="margin-top:12px; font-weight:600; color:var(--text-muted);">Loading live data...</p>
    </div>
  `;

  if (state.currentView === "faculty-analytics") {
    await renderFacultyAnalytics();
  } else if (state.currentView === "faculty-students") {
    await renderFacultyStudents();
  } else if (state.currentView === "faculty-training") {
    await renderFacultyTraining();
  } else if (state.currentView === "faculty-reports") {
    await renderFacultyReports();
  } else if (state.currentView === "recruiter-jobs") {
    await renderRecruiterJobs();
  } else if (state.currentView === "recruiter-ranking") {
    await renderRecruiterRanking();
  } else if (state.currentView === "recruiter-shortlist") {
    await renderRecruiterShortlist();
  }
}

// ==========================================
// 1. FACULTY / T&P VIEWS
// ==========================================

async function renderFacultyAnalytics() {
  const query = new URLSearchParams(state.filters).toString();
  const res = await apiRequest(`/faculty/analytics/batch?${query}`);
  const data = res.data || res;
  state.analyticsData = data;

  const container = document.getElementById("main-content-area");

  if (data.is_empty || data.total_students === 0) {
    container.innerHTML = `
      ${renderFilterCard()}
      <div class="panel-card empty-state">
        <div class="empty-icon">📊</div>
        <div class="empty-title">No Students Match Active Filters</div>
        <p class="empty-desc">There are no student records currently matching Department: <strong>${state.filters.department}</strong> and Batch: <strong>${state.filters.batch}</strong>.</p>
        <button class="btn-primary" style="margin-top:16px;" onclick="resetFilters()">Reset All Filters</button>
      </div>
    `;
    attachFilterListeners();
    return;
  }

  const { readiness_summary, skill_distribution, common_skill_gaps } = data;

  container.innerHTML = `
    ${renderFilterCard()}

    <!-- KPI Metric Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Cohort Students</div>
        <div class="stat-value">${data.total_students}</div>
        <div class="stat-subtext">Active Batch Profile</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Placement Job Ready</div>
        <div class="stat-value" style="color:#059669;">${readiness_summary.job_ready_pct}%</div>
        <div class="stat-subtext">${readiness_summary.job_ready_count} students meeting standard</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Cohort Readiness</div>
        <div class="stat-value" style="color:var(--teal-600);">${readiness_summary.avg_readiness_score}</div>
        <div class="stat-subtext">Out of 100 baseline</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Needs Upskilling</div>
        <div class="stat-value" style="color:#dc2626;">${readiness_summary.needs_upskilling_count}</div>
        <div class="stat-subtext">Targeted training recommended</div>
      </div>
    </div>

    <!-- Analytics Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- Skill Distribution by Category -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">Batch-Level Skill Distribution</div>
          <span class="badge badge-high">Multi-Source Averaged</span>
        </div>
        <div class="panel-body">
          ${Object.values(skill_distribution).map(cat => `
            <div class="dist-item">
              <div class="dist-header">
                <span>${cat.category_name}</span>
                <span><strong>${cat.average_score}%</strong> <span style="font-size:0.75rem; color:var(--text-muted);">(${cat.proficiency_band})</span></span>
              </div>
              <div class="dist-bar-bg">
                <div class="dist-bar-fill" style="width: ${cat.average_score}%;"></div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;">
                Skills tracked: ${cat.tracked_skills.join(", ")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Common Skill Gaps -->
      <div class="panel-card">
        <div class="panel-header">
          <div class="panel-title">Common Skill Gaps vs Industry Baseline (75%)</div>
          <span class="badge badge-upskill">${common_skill_gaps.length} Gaps Identified</span>
        </div>
        <div class="panel-body" style="padding:0;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Avg Score</th>
                <th>Shortfall</th>
                <th>Affected</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${common_skill_gaps.map(g => `
                <tr>
                  <td><strong>${g.skill}</strong></td>
                  <td>${g.avg_score}%</td>
                  <td style="color:#dc2626; font-weight:600;">-${g.gap} pts</td>
                  <td>${g.affected_students} (${g.affected_percentage}%)</td>
                  <td>
                    <span class="badge ${g.priority === 'Critical' ? 'badge-upskill' : g.priority === 'Moderate' ? 'badge-near' : 'badge-med'}">
                      ${g.priority}
                    </span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  attachFilterListeners();
}

function renderFilterCard() {
  return `
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">Department</label>
          <select id="filter-dept" class="filter-select">
            <option value="All" ${state.filters.department === 'All' ? 'selected' : ''}>All Departments</option>
            <option value="Computer Science & Engineering" ${state.filters.department === 'Computer Science & Engineering' ? 'selected' : ''}>Computer Science & Eng</option>
            <option value="Information Technology" ${state.filters.department === 'Information Technology' ? 'selected' : ''}>Information Technology</option>
            <option value="Data Science & AI" ${state.filters.department === 'Data Science & AI' ? 'selected' : ''}>Data Science & AI</option>
            <option value="Electronics & Communication" ${state.filters.department === 'Electronics & Communication' ? 'selected' : ''}>Electronics & Comm</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Batch</label>
          <select id="filter-batch" class="filter-select" style="min-width:120px;">
            <option value="All" ${state.filters.batch === 'All' ? 'selected' : ''}>All Batches</option>
            <option value="2025" ${state.filters.batch === '2025' ? 'selected' : ''}>Batch 2025</option>
            <option value="2026" ${state.filters.batch === '2026' ? 'selected' : ''}>Batch 2026</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Target Role</label>
          <select id="filter-role" class="filter-select">
            <option value="All" ${state.filters.target_role === 'All' ? 'selected' : ''}>All Roles</option>
            <option value="Backend Developer" ${state.filters.target_role === 'Backend Developer' ? 'selected' : ''}>Backend Developer</option>
            <option value="Full Stack Developer" ${state.filters.target_role === 'Full Stack Developer' ? 'selected' : ''}>Full Stack Developer</option>
            <option value="Cloud/DevOps Engineer" ${state.filters.target_role === 'Cloud/DevOps Engineer' ? 'selected' : ''}>Cloud/DevOps Engineer</option>
            <option value="Data Engineer" ${state.filters.target_role === 'Data Engineer' ? 'selected' : ''}>Data Engineer</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">Skill</label>
          <select id="filter-skill" class="filter-select" style="min-width:140px;">
            <option value="All" ${state.filters.skill === 'All' ? 'selected' : ''}>All Skills</option>
            <option value="Python" ${state.filters.skill === 'Python' ? 'selected' : ''}>Python</option>
            <option value="SQL" ${state.filters.skill === 'SQL' ? 'selected' : ''}>SQL</option>
            <option value="Docker" ${state.filters.skill === 'Docker' ? 'selected' : ''}>Docker</option>
            <option value="DSA" ${state.filters.skill === 'DSA' ? 'selected' : ''}>DSA</option>
            <option value="React" ${state.filters.skill === 'React' ? 'selected' : ''}>React</option>
          </select>
        </div>

        <button id="btn-apply-filters" class="filter-btn">Apply Filters</button>
      </div>
    </div>
  `;
}

function attachFilterListeners() {
  const btn = document.getElementById("btn-apply-filters");
  if (btn) {
    btn.addEventListener("click", () => {
      state.filters.department = document.getElementById("filter-dept").value;
      state.filters.batch = document.getElementById("filter-batch").value;
      state.filters.target_role = document.getElementById("filter-role").value;
      state.filters.skill = document.getElementById("filter-skill").value;
      loadCurrentViewData();
    });
  }
}

function resetFilters() {
  state.filters = { department: "All", batch: "All", target_role: "All", skill: "All" };
  loadCurrentViewData();
}

async function renderFacultyStudents() {
  const query = new URLSearchParams(state.filters).toString();
  const res = await apiRequest(`/faculty/students?${query}`);
  const students = res.students || [];

  const container = document.getElementById("main-content-area");
  container.innerHTML = `
    ${renderFilterCard()}

    <div class="table-container">
      <div class="panel-header">
        <div class="panel-title">Student Readiness Roster (${students.length} Students)</div>
        <span class="badge badge-high">Faculty Authorized View</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Department</th>
            <th>Batch</th>
            <th>Target Role</th>
            <th>Readiness Score</th>
            <th>Readiness Tier</th>
            <th>Confidence</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td><code>${s.roll_number}</code></td>
              <td><strong>${s.full_name}</strong></td>
              <td>${s.department}</td>
              <td>${s.batch}</td>
              <td>${s.target_role}</td>
              <td><strong>${s.overall_readiness}%</strong></td>
              <td>
                <span class="badge ${s.readiness_tier === 'Job Ready' ? 'badge-ready' : s.readiness_tier === 'Near Ready' ? 'badge-near' : 'badge-upskill'}">
                  ${s.readiness_tier}
                </span>
              </td>
              <td>
                <span class="badge ${s.confidence === 'High' ? 'badge-high' : s.confidence === 'Medium' ? 'badge-med' : 'badge-low'}">
                  ${s.confidence}
                </span>
              </td>
              <td>
                <button class="btn-primary btn-sm" onclick="openStudentDossier('${s.student_id}')">
                  View Dossier
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachFilterListeners();
}

async function openStudentDossier(studentId) {
  const res = await apiRequest(`/faculty/students/${studentId}`);
  if (res.status === "error") {
    alert(res.message);
    return;
  }
  const s = res.student;

  const modalHtml = `
    <div id="modal-dossier" class="modal-overlay">
      <div class="modal-content" style="max-width:760px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">${s.full_name} (Roll: ${s.roll_number})</div>
            <div style="font-size:0.8rem; color:var(--text-muted); margin-top:2px;">
              ${s.department} • Batch ${s.batch} • Target: <strong>${s.target_role}</strong>
            </div>
          </div>
          <button class="btn-secondary btn-sm" onclick="closeModal('modal-dossier')">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex; gap:16px; margin-bottom:20px;">
            <div style="flex:1; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.75rem; color:var(--text-muted);">Overall Readiness</div>
              <div style="font-size:1.5rem; font-weight:700; color:var(--teal-600);">${s.overall_readiness}%</div>
            </div>
            <div style="flex:1; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.75rem; color:var(--text-muted);">Readiness Tier</div>
              <div style="font-size:1.1rem; font-weight:700; margin-top:4px;">${s.readiness_tier}</div>
            </div>
            <div style="flex:1; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
              <div style="font-size:0.75rem; color:var(--text-muted);">Evidence Confidence</div>
              <div style="font-size:1.1rem; font-weight:700; color:#0f766e; margin-top:4px;">${s.confidence} Confidence</div>
            </div>
          </div>

          <h4 style="font-size:0.9rem; margin-bottom:8px;">Multi-Source Skill Evidence Verification</h4>
          <table class="data-table" style="margin-bottom:20px;">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Score</th>
                <th>Assessment</th>
                <th>GitHub Commits</th>
                <th>Verified Projects</th>
                <th>Cert/Internship</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(s.skills).map(([skName, sk]) => `
                <tr>
                  <td><strong>${skName}</strong></td>
                  <td><strong>${sk.score}%</strong></td>
                  <td>${sk.assessment ? `${sk.assessment}%` : 'N/A'}</td>
                  <td>${sk.github_commits || 0}</td>
                  <td>${sk.projects || 0}</td>
                  <td>
                    ${sk.verified_cert ? '<span class="badge badge-ready">Cert</span>' : ''}
                    ${sk.internship ? '<span class="badge badge-high">Intern</span>' : ''}
                  </td>
                  <td><span class="badge badge-${sk.confidence.toLowerCase()}">${sk.confidence}</span></td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h4 style="font-size:0.9rem; margin-bottom:6px;">Evidence Explanation</h4>
          <p style="font-size:0.85rem; color:#334155; background:#f1f5f9; padding:10px 14px; border-radius:var(--radius-sm); margin-bottom:16px;">
            ${s.evidence_summary}
          </p>

          <h4 style="font-size:0.9rem; margin-bottom:6px;">Training Cohort Progress</h4>
          <div style="font-size:0.85rem; color:#475569;">
            <div><strong>Enrolled Courses:</strong> ${s.training_progress.enrolled_courses.join(", ") || "None"}</div>
            <div><strong>Completed Courses:</strong> ${s.training_progress.completed_courses.join(", ") || "None"}</div>
            <div style="margin-top:6px;">
              Pre-training Score: <strong>${s.training_progress.pre_score}%</strong> ➔ Post-training: <strong>${s.training_progress.post_score}%</strong>
              <span style="color:#059669; font-weight:600;">(+${(s.training_progress.post_score - s.training_progress.pre_score).toFixed(1)} pts gain)</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeModal('modal-dossier')">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

async function renderFacultyTraining() {
  const query = new URLSearchParams({ department: state.filters.department, batch: state.filters.batch }).toString();
  const res = await apiRequest(`/faculty/analytics/training-progress?${query}`);
  const data = res.data || res;
  const cohorts = data.cohorts || [];

  const container = document.getElementById("main-content-area");
  container.innerHTML = `
    ${renderFilterCard()}

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Enrolled in Training</div>
        <div class="stat-value">${data.total_enrolled}</div>
        <div class="stat-subtext">Students in upskilling cohorts</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Average Cohort Gain</div>
        <div class="stat-value" style="color:#059669;">+${data.overall_average_gain} pts</div>
        <div class="stat-subtext">Pre vs Post test improvement</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Course Completion Rate</div>
        <div class="stat-value" style="color:var(--teal-600);">${data.avg_completion_rate}%</div>
        <div class="stat-subtext">Assignment & lab completion</div>
      </div>
    </div>

    <div class="table-container">
      <div class="panel-header">
        <div class="panel-title">Training Cohorts & Progress Details</div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Department</th>
            <th>Active Courses</th>
            <th>Pre Score</th>
            <th>Post Score</th>
            <th>Skill Gain</th>
            <th>Completion</th>
          </tr>
        </thead>
        <tbody>
          ${cohorts.map(c => `
            <tr>
              <td><strong>${c.full_name}</strong></td>
              <td>${c.department}</td>
              <td>${c.enrolled_courses.join(", ") || c.completed_courses.join(", ")}</td>
              <td>${c.pre_score}%</td>
              <td><strong>${c.post_score}%</strong></td>
              <td style="color:#059669; font-weight:700;">+${c.score_gain} pts</td>
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <div class="dist-bar-bg" style="width:70px; height:6px;">
                    <div class="dist-bar-fill" style="width:${c.completion_rate}%;"></div>
                  </div>
                  <span>${c.completion_rate}%</span>
                </div>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
  attachFilterListeners();
}

async function renderFacultyReports() {
  const container = document.getElementById("main-content-area");
  container.innerHTML = `
    <div class="panel-card" style="max-width:800px; margin: 0 auto;">
      <div class="panel-header">
        <div class="panel-title">Placement Readiness Report & Role-Safe Export</div>
        <span class="badge badge-high">FERPA & Privacy Compliant</span>
      </div>
      <div class="panel-body">
        <p style="font-size:0.85rem; color:#475569; margin-bottom:16px;">
          Generate audited, role-sanitized placement reports for college Training & Placement administration.
          In compliance with Section 4 & 17, this export strictly strips sensitive personal attributes and third-party credential tokens,
          exporting only authorized academic readiness metrics and evidence scores.
        </p>

        <div style="background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-sm); padding:16px; margin-bottom:20px;">
          <h4 style="font-size:0.85rem; margin-bottom:8px;">Included Fields in Report:</h4>
          <ul style="font-size:0.8rem; color:var(--text-muted); padding-left:20px; line-height:1.6;">
            <li>Student Identifier & University Roll Number</li>
            <li>Academic Department & Batch Cohort</li>
            <li>Declared Target Job Role</li>
            <li>Synthesized Overall Readiness Score (0 - 100)</li>
            <li>Placement Readiness Tier (Job Ready / Near Ready / Needs Upskilling)</li>
            <li>Multi-Source Evidence Confidence Rating</li>
          </ul>
        </div>

        <div style="display:flex; gap:12px;">
          <button class="btn-primary" onclick="downloadReadinessCsv()">
            📥 Download Readiness Report (CSV)
          </button>
          <button class="btn-secondary" onclick="previewReportData()">
            👁️ Preview Safe Report
          </button>
        </div>

        <div id="report-preview-area" style="margin-top:20px;"></div>
      </div>
    </div>
  `;
}

async function downloadReadinessCsv() {
  window.open(`${API_BASE}/faculty/reports/export?batch=${state.filters.batch}`, "_blank");
}

async function previewReportData() {
  const res = await apiRequest(`/faculty/reports/export?batch=${state.filters.batch}`);
  const area = document.getElementById("report-preview-area");
  if (res.csv_content) {
    area.innerHTML = `
      <h4 style="font-size:0.85rem; margin-bottom:6px;">CSV Data Preview:</h4>
      <pre style="background:#0f172a; color:#e2e8f0; padding:12px; border-radius:var(--radius-sm); font-size:0.75rem; overflow-x:auto;">${res.csv_content}</pre>
    `;
  }
}

// ==========================================
// 2. RECRUITER / COMPANY VIEWS
// ==========================================

async function renderRecruiterJobs() {
  const res = await apiRequest("/recruiter/jobs");
  const jobs = res.jobs || [];
  state.jobsList = jobs;

  const container = document.getElementById("main-content-area");
  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <div>
        <h3 style="font-size:1.1rem; font-weight:700;">Active Job Requisitions</h3>
        <p style="font-size:0.85rem; color:var(--text-muted);">Manage job descriptions and match consented candidates</p>
      </div>
      <button class="btn-primary" onclick="openJobBuilderModal()">
        + Create / Upload Job Description
      </button>
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;">
      ${jobs.map(j => `
        <div class="panel-card" style="padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
            <h4 style="font-size:1rem; font-weight:700;">${j.title}</h4>
            <span class="badge ${j.is_active ? 'badge-ready' : 'badge-upskill'}">${j.is_active ? 'Active' : 'Archived'}</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">
            <strong>${j.company}</strong> • ${j.department} • Min Readiness: ${j.min_readiness_score}%
          </div>
          <p style="font-size:0.85rem; color:#475569; margin-bottom:16px;">
            ${j.description}
          </p>

          <div style="margin-bottom:16px;">
            <div style="font-size:0.75rem; font-weight:600; color:var(--text-muted); margin-bottom:6px;">Required Skills & Thresholds:</div>
            <div style="display:flex; flex-wrap:wrap; gap:6px;">
              ${j.requirements.map(r => `
                <span class="badge ${r.is_required ? 'badge-high' : 'badge-med'}">
                  ${r.skill} ≥ ${r.min_score}% ${r.is_required ? '(Required)' : '(Preferred)'}
                </span>
              `).join("")}
            </div>
          </div>

          <div style="display:flex; gap:10px; margin-top:auto;">
            <button class="btn-primary" style="flex:1;" onclick="viewRankedCandidatesForJob('${j.job_id}')">
              🎯 View Ranked Candidates
            </button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function viewRankedCandidatesForJob(jobId) {
  state.selectedJobId = jobId;
  navigateTo("recruiter-ranking");
}

function openJobBuilderModal() {
  const modalHtml = `
    <div id="modal-job-builder" class="modal-overlay">
      <div class="modal-content" style="max-width:640px;">
        <div class="modal-header">
          <div class="modal-title">Create / Upload Job Description</div>
          <button class="btn-secondary btn-sm" onclick="closeModal('modal-job-builder')">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:flex; flex-direction:column; gap:14px;">
            <div>
              <label class="filter-label">Job Title *</label>
              <input id="job-title" type="text" class="filter-select" style="width:100%;" placeholder="e.g. Associate Backend Engineer" />
            </div>

            <div style="display:flex; gap:12px;">
              <div style="flex:1;">
                <label class="filter-label">Company Name *</label>
                <input id="job-company" type="text" class="filter-select" style="width:100%;" placeholder="e.g. Acme Tech" />
              </div>
              <div style="flex:1;">
                <label class="filter-label">Minimum Readiness Score (%)</label>
                <input id="job-min-readiness" type="number" min="0" max="100" class="filter-select" style="width:100%;" value="70" />
              </div>
            </div>

            <div>
              <label class="filter-label">Job Description / Requirements *</label>
              <textarea id="job-desc" rows="3" class="filter-select" style="width:100%;" placeholder="Describe core responsibilities and technical expectations..."></textarea>
            </div>

            <div>
              <label class="filter-label">Required Skills & Minimum Proficiency Thresholds (0 - 100)</label>
              <div id="job-skills-list" style="margin-top:6px; display:flex; flex-direction:column; gap:8px;">
                <div class="job-skill-row" style="display:flex; gap:8px; align-items:center;">
                  <select class="filter-select skill-select" style="flex:2;">
                    <option value="Python">Python</option>
                    <option value="SQL">SQL</option>
                    <option value="REST API">REST API</option>
                    <option value="Docker">Docker</option>
                    <option value="DSA">DSA</option>
                    <option value="React">React</option>
                  </select>
                  <input type="number" class="filter-select skill-min-score" min="0" max="100" value="70" placeholder="Min %" style="width:90px;" />
                  <label style="font-size:0.75rem; display:flex; align-items:center; gap:4px;">
                    <input type="checkbox" class="skill-required" checked /> Mandatory
                  </label>
                </div>
              </div>
              <button type="button" class="btn-secondary btn-sm" style="margin-top:8px;" onclick="addJobSkillRow()">+ Add Another Skill</button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeModal('modal-job-builder')">Cancel</button>
          <button class="btn-primary" onclick="submitNewJobRequisition()">Create Requisition</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function addJobSkillRow() {
  const container = document.getElementById("job-skills-list");
  const rowHtml = `
    <div class="job-skill-row" style="display:flex; gap:8px; align-items:center;">
      <select class="filter-select skill-select" style="flex:2;">
        <option value="SQL">SQL</option>
        <option value="Python">Python</option>
        <option value="REST API">REST API</option>
        <option value="Docker">Docker</option>
        <option value="DSA">DSA</option>
        <option value="React">React</option>
        <option value="AWS">AWS</option>
        <option value="PostgreSQL">PostgreSQL</option>
      </select>
      <input type="number" class="filter-select skill-min-score" min="0" max="100" value="65" placeholder="Min %" style="width:90px;" />
      <label style="font-size:0.75rem; display:flex; align-items:center; gap:4px;">
        <input type="checkbox" class="skill-required" checked /> Mandatory
      </label>
      <button class="btn-secondary btn-sm" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", rowHtml);
}

async function submitNewJobRequisition() {
  const title = document.getElementById("job-title").value.trim();
  const company = document.getElementById("job-company").value.trim();
  const minReadiness = parseFloat(document.getElementById("job-min-readiness").value) || 60;
  const desc = document.getElementById("job-desc").value.trim();

  // Validate inputs
  if (!title) {
    alert("Validation Error: Job Title cannot be empty.");
    return;
  }
  if (!company) {
    alert("Validation Error: Company Name cannot be empty.");
    return;
  }

  const skillRows = document.querySelectorAll(".job-skill-row");
  const requirements = [];
  for (const row of skillRows) {
    const skill = row.querySelector(".skill-select").value;
    const min_score = parseFloat(row.querySelector(".skill-min-score").value) || 60;
    const is_required = row.querySelector(".skill-required").checked;
    
    if (min_score < 0 || min_score > 100) {
      alert(`Validation Error: Minimum score for ${skill} must be between 0 and 100.`);
      return;
    }
    requirements.push({ skill, min_score, is_required, weight: 1.0 });
  }

  if (requirements.length === 0) {
    alert("Validation Error: At least one required skill must be defined.");
    return;
  }

  const payload = {
    title,
    company,
    min_readiness_score: minReadiness,
    requirements,
    description: desc,
    department: "Engineering"
  };

  const res = await apiRequest("/recruiter/jobs", "POST", payload);
  if (res.status === "success") {
    closeModal("modal-job-builder");
    alert("Job requisition posted successfully!");
    renderRecruiterJobs();
  } else {
    alert("Error creating job: " + res.message);
  }
}

async function renderRecruiterRanking() {
  const jobId = state.selectedJobId || "JOB-2026-01";
  const res = await apiRequest(`/recruiter/jobs/${jobId}/candidates`);
  const data = res.data || res;
  state.rankedCandidates = data;

  const container = document.getElementById("main-content-area");

  if (!data || data.is_empty || !data.candidates || data.candidates.length === 0) {
    container.innerHTML = `
      <div class="panel-card empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No Candidates Meet Current Matching Thresholds</div>
        <p class="empty-desc">
          None of the consented candidates satisfy all mandatory skill thresholds for <strong>${data ? data.job_title : jobId}</strong>.
          <br><br>
          <strong>Recommendation:</strong> Try slightly lowering the minimum skill thresholds in the job requisition or broadening the department scope.
        </p>
        <button class="btn-primary" style="margin-top:16px;" onclick="navigateTo('recruiter-jobs')">
          Edit Job Requirements
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-md); padding:16px 20px; margin-bottom:20px; display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="font-size:1.05rem; font-weight:700;">Candidate Matching for: ${data.job_title}</h3>
        <p style="font-size:0.8rem; color:var(--text-muted);">${data.company} • ${data.recommendation_summary}</p>
      </div>
      <div style="display:flex; gap:10px;">
        <span class="badge badge-high" style="padding:6px 10px;">Consented Candidates Only</span>
        <button class="btn-secondary btn-sm" onclick="navigateTo('recruiter-jobs')">Change Job</button>
      </div>
    </div>

    <!-- Candidate Cards List -->
    <div style="display:flex; flex-direction:column; gap:16px;">
      ${data.candidates.map(c => `
        <div class="panel-card" style="padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <div style="display:flex; align-items:center; gap:10px;">
                <h4 style="font-size:1.1rem; font-weight:700;">${c.candidate_alias}</h4>
                <span class="badge badge-ready">Consented to Placement</span>
                <span class="badge badge-${c.confidence.toLowerCase()}">${c.confidence} Confidence</span>
              </div>
              <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;">
                ${c.department} • Batch ${c.batch} • Target Role: ${c.target_role}
              </div>
            </div>

            <div style="text-align:right;">
              <div style="font-size:0.75rem; font-weight:600; color:var(--text-muted);">MATCH SCORE</div>
              <div style="font-size:1.75rem; font-weight:800; color:var(--teal-600);">${c.match_score}%</div>
            </div>
          </div>

          <!-- Matched & Missing Skills Badges -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:14px; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <div>
              <div style="font-size:0.75rem; font-weight:700; color:#059669; margin-bottom:6px;">✓ Matched Requirements:</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${c.matched_skills.map(m => `
                  <span class="badge badge-ready">
                    ${m.skill}: ${m.candidate_score}% (${m.status})
                  </span>
                `).join("") || '<span style="font-size:0.75rem; color:var(--text-muted);">None met</span>'}
              </div>
            </div>

            <div>
              <div style="font-size:0.75rem; font-weight:700; color:#dc2626; margin-bottom:6px;">⚠ Shortfalls / Missing:</div>
              <div style="display:flex; flex-wrap:wrap; gap:6px;">
                ${c.missing_skills.map(g => `
                  <span class="badge badge-upskill">
                    ${g.skill}: -${g.shortfall} pts (has ${g.candidate_score}%)
                  </span>
                `).join("") || '<span style="font-size:0.75rem; color:#059669;">Zero shortfalls!</span>'}
              </div>
            </div>
          </div>

          <!-- Explainable AI Text -->
          <div style="background:#f1f5f9; padding:10px 14px; border-radius:var(--radius-sm); font-size:0.85rem; color:#334155; margin-bottom:16px;">
            <strong>Explainable Assessment Reason:</strong> ${c.explanation}
          </div>

          <!-- Actions & Shortlist Status -->
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">Current Status: </span>
              <span class="badge ${c.shortlist_status === 'shortlisted' ? 'badge-high' : c.shortlist_status === 'interview_scheduled' ? 'badge-ready' : 'badge-med'}">
                ${c.shortlist_status.toUpperCase()}
              </span>
              ${c.shortlist_notes ? `<span style="font-size:0.75rem; color:var(--text-muted); margin-left:8px;">Note: "${c.shortlist_notes}"</span>` : ''}
            </div>

            <div style="display:flex; gap:10px;">
              <button class="btn-secondary btn-sm" onclick="openRecruiterCandidateModal('${c.student_id}')">
                View Approved Details
              </button>
              <button class="btn-primary btn-sm" onclick="openShortlistActionModal('${c.student_id}', '${c.candidate_alias}', '${data.job_id}')">
                Manage Shortlist Status
              </button>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

async function openRecruiterCandidateModal(studentId) {
  const res = await apiRequest(`/recruiter/candidates/${studentId}`);
  if (res.status === "error") {
    alert("Authorization / Privacy Restriction: " + res.message);
    return;
  }
  const c = res.candidate;

  const modalHtml = `
    <div id="modal-candidate-detail" class="modal-overlay">
      <div class="modal-content" style="max-width:680px;">
        <div class="modal-header">
          <div>
            <div class="modal-title">${c.candidate_alias}</div>
            <div style="font-size:0.8rem; color:var(--text-muted);">${c.department} • Batch ${c.batch} • Target: ${c.target_role}</div>
          </div>
          <button class="btn-secondary btn-sm" onclick="closeModal('modal-candidate-detail')">✕</button>
        </div>
        <div class="modal-body">
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:12px; border-radius:var(--radius-sm); margin-bottom:16px; font-size:0.85rem; color:#065f46;">
            <strong>✓ Verified Student Consent:</strong> This candidate has explicitly consented to campus recruitment matching. Internal academic disciplinary records and sensitive personal attributes are strictly withheld.
          </div>

          <h4 style="font-size:0.9rem; margin-bottom:8px;">Consented Technical Skill Proficiency</h4>
          <table class="data-table" style="margin-bottom:16px;">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Score</th>
                <th>Confidence</th>
                <th>Projects</th>
                <th>Credentials</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(c.skills).map(([skName, sk]) => `
                <tr>
                  <td><strong>${skName}</strong></td>
                  <td><strong>${sk.score}%</strong></td>
                  <td><span class="badge badge-${sk.confidence.toLowerCase()}">${sk.confidence}</span></td>
                  <td>${sk.projects_count} verified</td>
                  <td>
                    ${sk.verified_cert ? '<span class="badge badge-ready">Certified</span>' : ''}
                    ${sk.internship_experience ? '<span class="badge badge-high">Internship Exp</span>' : ''}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h4 style="font-size:0.9rem; margin-bottom:6px;">Verified Evidence Summary</h4>
          <p style="font-size:0.85rem; color:#334155; background:#f8fafc; padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            ${c.evidence_summary}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeModal('modal-candidate-detail')">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function openShortlistActionModal(studentId, alias, jobId) {
  const modalHtml = `
    <div id="modal-shortlist-action" class="modal-overlay">
      <div class="modal-content" style="max-width:480px;">
        <div class="modal-header">
          <div class="modal-title">Update Shortlist Status</div>
          <button class="btn-secondary btn-sm" onclick="closeModal('modal-shortlist-action')">✕</button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.85rem; margin-bottom:14px; color:var(--text-muted);">
            Updating recruitment pipeline status for <strong>${alias}</strong>.
          </p>

          <div style="display:flex; flex-direction:column; gap:12px;">
            <div>
              <label class="filter-label">Recruiter Stage</label>
              <select id="shortlist-status-select" class="filter-select" style="width:100%;">
                <option value="shortlisted">Shortlisted</option>
                <option value="reviewing">Under Review</option>
                <option value="interview_scheduled">Interview Scheduled</option>
                <option value="rejected">Passed / Rejected</option>
              </select>
            </div>

            <div>
              <label class="filter-label">Recruiter Notes</label>
              <textarea id="shortlist-notes-input" rows="3" class="filter-select" style="width:100%;" placeholder="Add optional recruitment evaluation notes..."></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="closeModal('modal-shortlist-action')">Cancel</button>
          <button class="btn-primary" onclick="submitShortlistStatus('${studentId}', '${jobId}')">Save Status</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

async function submitShortlistStatus(studentId, jobId) {
  const status = document.getElementById("shortlist-status-select").value;
  const notes = document.getElementById("shortlist-notes-input").value.trim();

  const res = await apiRequest("/recruiter/shortlist", "POST", {
    job_id: jobId,
    student_id: studentId,
    status,
    notes
  });

  if (res.status === "success") {
    closeModal("modal-shortlist-action");
    alert("Candidate shortlist status updated and persisted!");
    renderRecruiterRanking();
  } else {
    alert("Error updating status: " + res.message);
  }
}

async function renderRecruiterShortlist() {
  const res = await apiRequest("/recruiter/shortlist");
  const list = res.shortlisted || [];

  const container = document.getElementById("main-content-area");
  container.innerHTML = `
    <div class="table-container">
      <div class="panel-header">
        <div class="panel-title">Shortlisted Candidates Across Requisitions (${list.length})</div>
        <span class="badge badge-high">Active Pipeline</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Candidate Alias</th>
            <th>Job Requisition</th>
            <th>Department</th>
            <th>Batch</th>
            <th>Readiness</th>
            <th>Status</th>
            <th>Recruiter Notes</th>
            <th>Last Updated</th>
          </tr>
        </thead>
        <tbody>
          ${list.map(s => `
            <tr>
              <td><strong>${s.candidate_alias}</strong></td>
              <td>${s.job_title}</td>
              <td>${s.department}</td>
              <td>${s.batch}</td>
              <td><strong>${s.overall_readiness}%</strong></td>
              <td>
                <span class="badge ${s.status === 'shortlisted' ? 'badge-high' : s.status === 'interview_scheduled' ? 'badge-ready' : 'badge-med'}">
                  ${s.status.toUpperCase()}
                </span>
              </td>
              <td style="color:#475569; font-size:0.8rem;">${s.notes || '-'}</td>
              <td style="color:var(--text-muted); font-size:0.75rem;">${s.updated_at ? s.updated_at.split('T')[0] : 'Today'}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// --- Generic Modal Closer ---
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.remove();
}

// ==========================================
// 3. ISOLATED FALLBACK STORE (MOCK RUNNER)
// ==========================================
// In case the standalone server is stopped, the client gracefully operates offline
// with an isolated, self-contained mock implementation of the backend services.

const MOCK_TAXONOMY = {
  "Backend": ["Python", "SQL", "REST API", "PostgreSQL", "FastAPI", "Node.js"],
  "Frontend": ["React", "JavaScript", "HTML/CSS", "TypeScript"],
  "DevOps/Cloud": ["Docker", "AWS", "CI/CD", "Git"],
  "Foundational": ["DSA", "System Design", "OOP"]
};

const MOCK_STUDENTS = [
  {
    student_id: "STU-2026-001",
    roll_number: "CS22B101",
    full_name: "Aarav Sharma",
    candidate_alias: "Candidate CS-01",
    department: "Computer Science & Engineering",
    batch: "2026",
    target_role: "Backend Developer",
    cgpa: 8.7,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 84.5,
    readiness_tier: "Job Ready",
    confidence: "High",
    skills: {
      "Python": { score: 88.0, confidence: "High", assessment: 92.0, github_commits: 145, projects: 3, verified_cert: true, internship: true },
      "SQL": { score: 82.0, confidence: "High", assessment: 85.0, github_commits: 60, projects: 2, verified_cert: true, internship: false },
      "REST API": { score: 79.0, confidence: "High", assessment: 80.0, github_commits: 95, projects: 3, verified_cert: false, internship: true },
      "DSA": { score: 85.0, confidence: "High", assessment: 88.0, github_commits: 210, projects: 1, verified_cert: false, internship: false },
      "Docker": { score: 68.0, confidence: "Medium", assessment: 65.0, github_commits: 30, projects: 1, verified_cert: false, internship: false },
      "AWS": { score: 45.0, confidence: "Low", assessment: 50.0, github_commits: 10, projects: 0, verified_cert: false, internship: false },
      "PostgreSQL": { score: 80.0, confidence: "High", assessment: 82.0, github_commits: 45, projects: 2, verified_cert: true, internship: false }
    },
    training_progress: {
      enrolled_courses: ["Docker & Cloud Infrastructure", "Advanced System Design"],
      completed_courses: ["RESTful Microservices with FastAPI"],
      pre_score: 62.0,
      post_score: 84.5,
      completion_rate: 80
    },
    evidence_summary: "Strong evidence across GitHub (145 commits), 3 verified backend projects, top 10% assessment score, verified PostgreSQL credential."
  },
  {
    student_id: "STU-2026-002",
    roll_number: "CS22B104",
    full_name: "Priya Nair",
    candidate_alias: "Candidate CS-04",
    department: "Computer Science & Engineering",
    batch: "2026",
    target_role: "Full Stack Developer",
    cgpa: 9.1,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 88.0,
    readiness_tier: "Job Ready",
    confidence: "High",
    skills: {
      "React": { score: 90.0, confidence: "High", assessment: 94.0, github_commits: 180, projects: 4, verified_cert: true, internship: true },
      "JavaScript": { score: 92.0, confidence: "High", assessment: 95.0, github_commits: 200, projects: 4, verified_cert: true, internship: true },
      "Python": { score: 75.0, confidence: "Medium", assessment: 78.0, github_commits: 50, projects: 2, verified_cert: false, internship: false },
      "REST API": { score: 84.0, confidence: "High", assessment: 86.0, github_commits: 110, projects: 3, verified_cert: true, internship: true },
      "DSA": { score: 80.0, confidence: "High", assessment: 82.0, github_commits: 120, projects: 1, verified_cert: false, internship: false },
      "Docker": { score: 55.0, confidence: "Low", assessment: 58.0, github_commits: 15, projects: 1, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: ["Docker Essentials"],
      completed_courses: ["Modern React & State Management", "Clean REST API Architecture"],
      pre_score: 70.0,
      post_score: 88.0,
      completion_rate: 90
    },
    evidence_summary: "Outstanding frontend & API skills, 4 production-grade React apps, verified internship at SaaS startup."
  },
  {
    student_id: "STU-2026-003",
    roll_number: "IT22B205",
    full_name: "Rohan Deshmukh",
    candidate_alias: "Candidate IT-05",
    department: "Information Technology",
    batch: "2026",
    target_role: "Cloud/DevOps Engineer",
    cgpa: 8.1,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 82.0,
    readiness_tier: "Job Ready",
    confidence: "High",
    skills: {
      "Docker": { score: 85.0, confidence: "High", assessment: 88.0, github_commits: 120, projects: 3, verified_cert: true, internship: true },
      "AWS": { score: 78.0, confidence: "High", assessment: 80.0, github_commits: 40, projects: 2, verified_cert: true, internship: false },
      "Git": { score: 90.0, confidence: "High", assessment: 92.0, github_commits: 160, projects: 3, verified_cert: true, internship: true },
      "CI/CD": { score: 74.0, confidence: "Medium", assessment: 76.0, github_commits: 50, projects: 2, verified_cert: false, internship: false },
      "Python": { score: 70.0, confidence: "Medium", assessment: 72.0, github_commits: 45, projects: 1, verified_cert: false, internship: false },
      "DSA": { score: 72.0, confidence: "Medium", assessment: 75.0, github_commits: 80, projects: 0, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: ["Kubernetes & Production GitOps"],
      completed_courses: ["Docker Fundamentals", "AWS Cloud Practitioner Prep"],
      pre_score: 60.0,
      post_score: 82.0,
      completion_rate: 85
    },
    evidence_summary: "Strong Docker/AWS hands-on experience with automated CI/CD pipeline repositories."
  },
  {
    student_id: "STU-2026-004",
    roll_number: "DS22B302",
    full_name: "Ananya Mukherjee",
    candidate_alias: "Candidate DS-02",
    department: "Data Science & AI",
    batch: "2026",
    target_role: "Data Engineer",
    cgpa: 8.9,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 86.0,
    readiness_tier: "Job Ready",
    confidence: "High",
    skills: {
      "Python": { score: 92.0, confidence: "High", assessment: 95.0, github_commits: 160, projects: 4, verified_cert: true, internship: true },
      "SQL": { score: 90.0, confidence: "High", assessment: 92.0, github_commits: 90, projects: 3, verified_cert: true, internship: true },
      "PostgreSQL": { score: 86.0, confidence: "High", assessment: 88.0, github_commits: 70, projects: 3, verified_cert: true, internship: false },
      "DSA": { score: 78.0, confidence: "Medium", assessment: 80.0, github_commits: 110, projects: 1, verified_cert: false, internship: false },
      "AWS": { score: 68.0, confidence: "Medium", assessment: 70.0, github_commits: 30, projects: 1, verified_cert: false, internship: false },
      "Docker": { score: 62.0, confidence: "Medium", assessment: 60.0, github_commits: 25, projects: 1, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: ["Distributed Data Pipelines with Spark"],
      completed_courses: ["Advanced SQL Analytics", "Python for Data Engineering"],
      pre_score: 68.0,
      post_score: 86.0,
      completion_rate: 85
    },
    evidence_summary: "Top tier SQL & Python pipeline scores, 4 reproducible data engineering repositories."
  },
  {
    student_id: "STU-2026-005",
    roll_number: "CS22B115",
    full_name: "Vikram Rathore",
    candidate_alias: "Candidate CS-15",
    department: "Computer Science & Engineering",
    batch: "2026",
    target_role: "Backend Developer",
    cgpa: 7.4,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 63.0,
    readiness_tier: "Needs Upskilling",
    confidence: "Medium",
    skills: {
      "Python": { score: 68.0, confidence: "Medium", assessment: 70.0, github_commits: 40, projects: 1, verified_cert: false, internship: false },
      "SQL": { score: 62.0, confidence: "Medium", assessment: 65.0, github_commits: 20, projects: 1, verified_cert: false, internship: false },
      "REST API": { score: 58.0, confidence: "Low", assessment: 60.0, github_commits: 15, projects: 1, verified_cert: false, internship: false },
      "DSA": { score: 55.0, confidence: "Medium", assessment: 58.0, github_commits: 70, projects: 0, verified_cert: false, internship: false },
      "Docker": { score: 38.0, confidence: "Low", assessment: 40.0, github_commits: 0, projects: 0, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: ["Backend Development Foundation", "DSA Core Problems"],
      completed_courses: [],
      pre_score: 48.0,
      post_score: 63.0,
      completion_rate: 45
    },
    evidence_summary: "Enrolled in remedial backend cohort; currently bridging gaps in REST APIs and Docker."
  },
  {
    student_id: "STU-2026-006",
    roll_number: "EC22B401",
    full_name: "Kavita Reddy",
    candidate_alias: "Candidate EC-01",
    department: "Electronics & Communication",
    batch: "2026",
    target_role: "Backend Developer",
    cgpa: 8.2,
    consented_placement: false, // Strict privacy test case: opted OUT of recruiter sharing
    is_demo_record: true,
    overall_readiness: 75.0,
    readiness_tier: "Near Ready",
    confidence: "Medium",
    skills: {
      "Python": { score: 80.0, confidence: "High", assessment: 84.0, github_commits: 80, projects: 2, verified_cert: true, internship: false },
      "SQL": { score: 72.0, confidence: "Medium", assessment: 75.0, github_commits: 30, projects: 1, verified_cert: false, internship: false },
      "DSA": { score: 76.0, confidence: "High", assessment: 80.0, github_commits: 130, projects: 0, verified_cert: false, internship: false },
      "REST API": { score: 65.0, confidence: "Medium", assessment: 68.0, github_commits: 25, projects: 1, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: ["FastAPI & Microservices"],
      completed_courses: ["Python Intermediate"],
      pre_score: 58.0,
      post_score: 75.0,
      completion_rate: 70
    },
    evidence_summary: "Good cross-department transition to software development; Opted out of 3rd-party recruiter listings."
  },
  {
    student_id: "STU-2025-007",
    roll_number: "CS21B108",
    full_name: "Tanmay Verma",
    candidate_alias: "Candidate CS-08",
    department: "Computer Science & Engineering",
    batch: "2025",
    target_role: "Backend Developer",
    cgpa: 8.5,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 89.0,
    readiness_tier: "Job Ready",
    confidence: "High",
    skills: {
      "Python": { score: 90.0, confidence: "High", assessment: 92.0, github_commits: 220, projects: 4, verified_cert: true, internship: true },
      "FastAPI": { score: 88.0, confidence: "High", assessment: 90.0, github_commits: 130, projects: 3, verified_cert: false, internship: true },
      "SQL": { score: 84.0, confidence: "High", assessment: 86.0, github_commits: 80, projects: 3, verified_cert: true, internship: true },
      "Docker": { score: 76.0, confidence: "High", assessment: 78.0, github_commits: 50, projects: 2, verified_cert: true, internship: false },
      "REST API": { score: 91.0, confidence: "High", assessment: 94.0, github_commits: 150, projects: 4, verified_cert: true, internship: true },
      "DSA": { score: 82.0, confidence: "High", assessment: 85.0, github_commits: 180, projects: 1, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: [],
      completed_courses: ["Enterprise Architecture", "Docker in Production"],
      pre_score: 75.0,
      post_score: 89.0,
      completion_rate: 100
    },
    evidence_summary: "Completed 6-month software development internship; 4 production FastAPI microservices."
  },
  {
    student_id: "STU-2025-008",
    roll_number: "IT21B210",
    full_name: "Meera Sen",
    candidate_alias: "Candidate IT-10",
    department: "Information Technology",
    batch: "2025",
    target_role: "Full Stack Developer",
    cgpa: 8.3,
    consented_placement: true,
    is_demo_record: true,
    overall_readiness: 81.0,
    readiness_tier: "Job Ready",
    confidence: "High",
    skills: {
      "React": { score: 85.0, confidence: "High", assessment: 88.0, github_commits: 140, projects: 3, verified_cert: true, internship: true },
      "Node.js": { score: 80.0, confidence: "High", assessment: 82.0, github_commits: 90, projects: 2, verified_cert: false, internship: true },
      "SQL": { score: 76.0, confidence: "Medium", assessment: 78.0, github_commits: 40, projects: 2, verified_cert: false, internship: false },
      "REST API": { score: 82.0, confidence: "High", assessment: 85.0, github_commits: 80, projects: 2, verified_cert: false, internship: true },
      "Docker": { score: 60.0, confidence: "Medium", assessment: 62.0, github_commits: 20, projects: 1, verified_cert: false, internship: false }
    },
    training_progress: {
      enrolled_courses: ["Full Stack MERN Advanced"],
      completed_courses: ["Frontend Performance Optimization"],
      pre_score: 65.0,
      post_score: 81.0,
      completion_rate: 90
    },
    evidence_summary: "Active contributor to open-source UI libraries, strong Node/React integration evidence."
  }
];

const MOCK_JOBS = [
  {
    job_id: "JOB-2026-01",
    title: "Junior Backend Engineer",
    company: "Nexus FinTech Labs",
    department: "Engineering",
    min_experience_years: 0.0,
    min_readiness_score: 70.0,
    requirements: [
      { skill: "Python", min_score: 75.0, is_required: true, weight: 1.5 },
      { skill: "SQL", min_score: 70.0, is_required: true, weight: 1.2 },
      { skill: "REST API", min_score: 65.0, is_required: true, weight: 1.0 },
      { skill: "Docker", min_score: 50.0, is_required: false, weight: 0.8 },
      { skill: "DSA", min_score: 65.0, is_required: true, weight: 1.0 }
    ],
    preferred_skills: ["PostgreSQL", "FastAPI", "Git"],
    description: "Looking for entry-level backend engineers capable of building scalable REST microservices with Python and relational databases.",
    is_active: true,
    created_at: "2026-10-15T10:00:00Z"
  },
  {
    job_id: "JOB-2026-02",
    title: "Associate Full Stack Developer",
    company: "CloudScale Systems",
    department: "Platform Services",
    min_experience_years: 0.0,
    min_readiness_score: 75.0,
    requirements: [
      { skill: "React", min_score: 80.0, is_required: true, weight: 1.5 },
      { skill: "JavaScript", min_score: 80.0, is_required: true, weight: 1.2 },
      { skill: "REST API", min_score: 70.0, is_required: true, weight: 1.0 },
      { skill: "DSA", min_score: 70.0, is_required: true, weight: 1.0 }
    ],
    preferred_skills: ["Node.js", "Docker", "TypeScript"],
    description: "Seeking skilled frontend & full stack engineers with solid React experience and clean API design skills.",
    is_active: true,
    created_at: "2026-10-20T14:30:00Z"
  },
  {
    job_id: "JOB-2026-03",
    title: "Cloud Infrastructure Associate",
    company: "Aura Cloud Networks",
    department: "DevOps / Infrastructure",
    min_experience_years: 0.0,
    min_readiness_score: 65.0,
    requirements: [
      { skill: "Docker", min_score: 70.0, is_required: true, weight: 1.5 },
      { skill: "AWS", min_score: 65.0, is_required: true, weight: 1.2 },
      { skill: "Git", min_score: 75.0, is_required: true, weight: 1.0 },
      { skill: "CI/CD", min_score: 60.0, is_required: false, weight: 0.8 }
    ],
    preferred_skills: ["Python", "Linux", "Kubernetes"],
    description: "Junior DevOps position focused on cloud automation, container management, and CI/CD pipelines.",
    is_active: true,
    created_at: "2026-10-25T09:15:00Z"
  }
];

const MOCK_SHORTLIST_STORE = {
  "JOB-2026-01:STU-2026-001": {
    job_id: "JOB-2026-01",
    student_id: "STU-2026-001",
    status: "shortlisted",
    notes: "Impressive project repository with verified PostgreSQL credential.",
    updated_at: "2026-10-28T16:00:00Z"
  }
};

function filterMockStudents(dept, batch, role, skill) {
  return MOCK_STUDENTS.filter(s => {
    if (dept && dept !== "All" && s.department !== dept) return false;
    if (batch && batch !== "All" && s.batch !== batch) return false;
    if (role && role !== "All" && s.target_role !== role) return false;
    if (skill && skill !== "All" && !s.skills[skill]) return false;
    return true;
  });
}

function fallbackLocalHandler(endpoint, method, body) {
  const urlObj = new URL(endpoint, "http://dummy");
  const path = urlObj.pathname;
  const params = Object.fromEntries(urlObj.searchParams.entries());

  // 1. Batch Analytics
  if (path === "/faculty/analytics/batch") {
    const students = filterMockStudents(params.department, params.batch, params.target_role, params.skill);
    const total = students.length;
    if (total === 0) {
      return {
        status: "success",
        is_empty: true,
        data: {
          total_students: 0,
          readiness_summary: { job_ready_count: 0, near_ready_count: 0, needs_upskilling_count: 0, job_ready_pct: 0, avg_readiness_score: 0 },
          skill_distribution: {},
          common_skill_gaps: [],
          is_empty: true
        }
      };
    }

    const jobReady = students.filter(s => s.readiness_tier === "Job Ready").length;
    const nearReady = students.filter(s => s.readiness_tier === "Near Ready").length;
    const needsUpskill = students.filter(s => s.readiness_tier === "Needs Upskilling").length;
    const avgReadiness = students.reduce((acc, s) => acc + s.overall_readiness, 0) / total;

    const allScores = {};
    students.forEach(s => {
      Object.entries(s.skills).forEach(([sk, obj]) => {
        if (!allScores[sk]) allScores[sk] = [];
        allScores[sk].push(obj.score);
      });
    });

    const skillDist = {};
    Object.entries(MOCK_TAXONOMY).forEach(([cat, skills]) => {
      const catScores = [];
      skills.forEach(sk => {
        if (allScores[sk]) catScores.push(...allScores[sk]);
      });
      const avg = catScores.length ? (catScores.reduce((a, b) => a + b, 0) / catScores.length) : 0;
      skillDist[cat] = {
        category_name: cat,
        average_score: Math.round(avg * 10) / 10,
        tracked_skills: skills.filter(sk => allScores[sk]),
        proficiency_band: avg >= 80 ? "Advanced" : avg >= 60 ? "Intermediate" : "Developing"
      };
    });

    const BENCHMARK = 75.0;
    const gaps = [];
    Object.entries(allScores).forEach(([sk, scList]) => {
      const avg = scList.reduce((a, b) => a + b, 0) / scList.length;
      const gap = BENCHMARK - avg;
      const shortfallCount = scList.filter(sc => sc < BENCHMARK).length;
      if (gap > 0) {
        gaps.push({
          skill: sk,
          avg_score: Math.round(avg * 10) / 10,
          benchmark_score: BENCHMARK,
          gap: Math.round(gap * 10) / 10,
          affected_students: shortfallCount,
          affected_percentage: Math.round((shortfallCount / total) * 1000) / 10,
          priority: gap > 20 ? "Critical" : gap > 10 ? "Moderate" : "Low"
        });
      }
    });
    gaps.sort((a, b) => b.gap - a.gap);

    return {
      status: "success",
      data: {
        total_students: total,
        readiness_summary: {
          job_ready_count: jobReady,
          near_ready_count: nearReady,
          needs_upskilling_count: needsUpskill,
          job_ready_pct: Math.round((jobReady / total) * 1000) / 10,
          avg_readiness_score: Math.round(avgReadiness * 10) / 10
        },
        skill_distribution: skillDist,
        common_skill_gaps: gaps,
        is_empty: false
      }
    };
  }

  // 2. Student Roster
  if (path === "/faculty/students") {
    const students = filterMockStudents(params.department, params.batch, params.target_role, params.skill);
    return {
      status: "success",
      total: students.length,
      students: students,
      is_empty: students.length === 0
    };
  }

  // 3. Student Detail Dossier
  if (path.startsWith("/faculty/students/")) {
    const sId = path.split("/").pop();
    const st = MOCK_STUDENTS.find(s => s.student_id === sId);
    if (!st) return { status: "error", message: `Student '${sId}' not found.` };
    return { status: "success", student: st };
  }

  // 4. Training Progress
  if (path === "/faculty/analytics/training-progress") {
    const students = filterMockStudents(params.department, params.batch);
    const cohorts = students.map(s => {
      const tp = s.training_progress;
      return {
        student_id: s.student_id,
        full_name: s.full_name,
        department: s.department,
        batch: s.batch,
        enrolled_courses: tp.enrolled_courses || [],
        completed_courses: tp.completed_courses || [],
        pre_score: tp.pre_score,
        post_score: tp.post_score,
        score_gain: Math.round((tp.post_score - tp.pre_score) * 10) / 10,
        completion_rate: tp.completion_rate
      };
    });
    const avgGain = cohorts.length ? cohorts.reduce((a, b) => a + b.score_gain, 0) / cohorts.length : 0;
    const avgComp = cohorts.length ? cohorts.reduce((a, b) => a + b.completion_rate, 0) / cohorts.length : 0;
    return {
      status: "success",
      data: {
        cohorts,
        overall_average_gain: Math.round(avgGain * 10) / 10,
        total_enrolled: cohorts.length,
        avg_completion_rate: Math.round(avgComp * 10) / 10
      }
    };
  }

  // 5. Reports Export
  if (path === "/faculty/reports/export") {
    const students = filterMockStudents(params.department, params.batch);
    let csv = "StudentID,RollNumber,FullName,Department,Batch,TargetRole,OverallReadiness,ReadinessTier,Confidence,DemoRecord\n";
    students.forEach(s => {
      csv += `${s.student_id},${s.roll_number},"${s.full_name}","${s.department}",${s.batch},"${s.target_role}",${s.overall_readiness},${s.readiness_tier},${s.confidence},true\n`;
    });
    return {
      status: "success",
      content_type: "text/csv",
      filename: `skillbridge_readiness_${params.batch || "all"}.csv`,
      csv_content: csv
    };
  }

  // 6. Recruiter Jobs
  if (path === "/recruiter/jobs") {
    if (method === "GET") {
      return { status: "success", jobs: MOCK_JOBS, total: MOCK_JOBS.length };
    }
    if (method === "POST") {
      const newJob = {
        job_id: `JOB-2026-${String(MOCK_JOBS.length + 1).padStart(2, "0")}`,
        title: body.title,
        company: body.company,
        department: body.department || "Engineering",
        min_experience_years: 0.0,
        min_readiness_score: body.min_readiness_score || 60,
        requirements: body.requirements || [],
        preferred_skills: body.preferred_skills || [],
        description: body.description || "",
        is_active: true,
        created_at: new Date().toISOString()
      };
      MOCK_JOBS.unshift(newJob);
      return { status: "success", job: newJob };
    }
  }

  // 7. Recruiter Ranking
  if (path.startsWith("/recruiter/jobs/") && path.endsWith("/candidates")) {
    const parts = path.split("/");
    const jobId = parts[parts.indexOf("jobs") + 1];
    const job = MOCK_JOBS.find(j => j.job_id === jobId) || MOCK_JOBS[0];

    const reqs = job.requirements || [];
    const pool = MOCK_STUDENTS.filter(s => s.consented_placement);

    const ranked = pool.map(s => {
      let earnedWeight = 0;
      let totalWeight = 0;
      let metCount = 0;
      const matched = [];
      const missing = [];

      reqs.forEach(r => {
        const w = r.weight || 1.0;
        if (r.is_required) totalWeight += w;
        const skObj = s.skills[r.skill];
        if (skObj && skObj.score >= r.min_score) {
          if (r.is_required) {
            earnedWeight += w;
            metCount++;
          }
          matched.push({
            skill: r.skill,
            candidate_score: skObj.score,
            required_score: r.min_score,
            status: skObj.score >= r.min_score + 10 ? "Exceeds" : "Meets",
            confidence: skObj.confidence,
            is_mandatory: r.is_required
          });
        } else {
          const cScore = skObj ? skObj.score : 0;
          missing.push({
            skill: r.skill,
            candidate_score: cScore,
            required_score: r.min_score,
            shortfall: Math.round((r.min_score - cScore) * 10) / 10,
            is_mandatory: r.is_required
          });
        }
      });

      const baseScore = totalWeight > 0 ? (earnedWeight / totalWeight) * 85 : 70;
      const finalScore = Math.min(99, Math.max(20, Math.round(baseScore + (s.overall_readiness / 100) * 5)));

      const keyPos = matched.slice(0, 3).map(m => `${m.skill} (${Math.round(m.candidate_score)}/100)`);
      const keyMis = missing.slice(0, 2).map(g => `${g.skill} (-${Math.round(g.shortfall)} pts)`);
      let explanation = `Candidate meets ${metCount} of ${reqs.length} job requirements with overall readiness score of ${s.overall_readiness}%.`;
      if (keyPos.length) explanation += ` Strong evidence in: ${keyPos.join(", ")}.`;
      if (keyMis.length) explanation += ` Primary shortfall in: ${keyMis.join(", ")}.`;

      const slKey = `${job.job_id}:${s.student_id}`;
      const slRecord = MOCK_SHORTLIST_STORE[slKey] || {};

      return {
        student_id: s.student_id,
        candidate_alias: s.candidate_alias,
        department: s.department,
        batch: s.batch,
        target_role: s.target_role,
        match_score: finalScore,
        matched_skills: matched,
        missing_skills: missing,
        explanation: explanation,
        shortlist_status: slRecord.status || "new",
        shortlist_notes: slRecord.notes || "",
        confidence: s.confidence,
        overall_readiness: s.overall_readiness,
        is_demo_record: true
      };
    });

    ranked.sort((a, b) => b.match_score - a.match_score);

    return {
      status: "success",
      data: {
        job_id: job.job_id,
        job_title: job.title,
        company: job.company,
        total_matches: ranked.length,
        candidates: ranked,
        is_empty: ranked.length === 0,
        recommendation_summary: `Ranked ${ranked.length} consented candidates against ${reqs.length} defined criteria.`
      }
    };
  }

  // 8. Recruiter Candidate Detail (with Consent Guard)
  if (path.startsWith("/recruiter/candidates/")) {
    const cId = path.split("/").pop();
    const st = MOCK_STUDENTS.find(s => s.student_id === cId);
    if (!st) return { status: "error", message: `Candidate '${cId}' not found.`, code: 404 };
    if (!st.consented_placement) {
      return { status: "error", message: "This candidate has not consented to share their profile with external recruiters.", code: 403 };
    }
    const publicSkills = {};
    Object.entries(st.skills).forEach(([sk, v]) => {
      publicSkills[sk] = {
        score: v.score,
        confidence: v.confidence,
        projects_count: v.projects || 0,
        verified_cert: v.verified_cert || false,
        internship_experience: v.internship || false
      };
    });
    return {
      status: "success",
      candidate: {
        student_id: st.student_id,
        candidate_alias: st.candidate_alias,
        department: st.department,
        batch: st.batch,
        target_role: st.target_role,
        overall_readiness: st.overall_readiness,
        confidence: st.confidence,
        skills: publicSkills,
        evidence_summary: st.evidence_summary,
        is_demo_record: true
      }
    };
  }

  // 9. Shortlist Operations
  if (path === "/recruiter/shortlist") {
    if (method === "POST") {
      const key = `${body.job_id}:${body.student_id}`;
      MOCK_SHORTLIST_STORE[key] = {
        job_id: body.job_id,
        student_id: body.student_id,
        status: body.status,
        notes: body.notes || "",
        updated_at: new Date().toISOString()
      };
      return { status: "success", record: MOCK_SHORTLIST_STORE[key] };
    }
    if (method === "GET") {
      const records = Object.values(MOCK_SHORTLIST_STORE);
      const enriched = records.map(r => {
        const j = MOCK_JOBS.find(job => job.job_id === r.job_id);
        const s = MOCK_STUDENTS.find(stu => stu.student_id === r.student_id);
        return {
          ...r,
          job_title: j ? j.title : "Unknown Requisition",
          candidate_alias: s ? s.candidate_alias : "Candidate",
          department: s ? s.department : "Engineering",
          batch: s ? s.batch : "2026",
          overall_readiness: s ? s.overall_readiness : 70
        };
      });
      return { status: "success", total: enriched.length, shortlisted: enriched };
    }
  }

  return { status: "success", is_mock: true };
}
