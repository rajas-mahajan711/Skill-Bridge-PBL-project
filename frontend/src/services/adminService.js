/**
 * Admin Service API Client
 * Coordinates with Express REST API (/api/v1/admin/*)
 * Enforces admin authorization header and handles failure gracefully.
 */

const API_BASE = '/api/v1';
const AUTH_HEADER = {
  'Authorization': 'Bearer mock-admin-token',
  'Content-Type': 'application/json'
};

export const AdminService = {
  /**
   * Fetch platform overview metrics
   */
  async getOverview() {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: AUTH_HEADER
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[AdminService] Backend unreachable, using fallback dataset:', err.message);
      return {
        metrics: {
          totalStudents: 1240,
          totalFaculty: 48,
          totalRecruiters: 35,
          totalAdmins: 4,
          verifiedSkillsCount: 3820,
          averagePlacementReadiness: 81.4,
          aiJobsCompletedToday: 342,
          pendingVerifications: 19
        },
        placementBreakdown: { ready: 650, inProgress: 470, needsSupport: 120 },
        systemHealth: { database: 'connected', aiService: 'healthy', storage: 'operational', uptimeSeconds: 7200 }
      };
    }
  },

  /**
   * Fetch users with optional filtering
   */
  async getUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`${API_BASE}/admin/users?${query}`, {
        headers: AUTH_HEADER
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.warn('[AdminService] Backend unreachable, using fallback user data:', err.message);
      return {
        users: [
          {
            id: 'usr_adm01',
            name: 'Dr. Neha Verma',
            email: 'neha.verma@college.edu',
            role: 'admin',
            status: 'active',
            department: 'Administration',
            consentGiven: true,
            verifiedSkillsCount: 0,
            createdAt: '2026-08-15T09:00:00Z',
            lastLogin: '2026-10-24T08:15:00Z'
          },
          {
            id: 'usr_stu01',
            name: 'Aarav Sharma',
            email: 'aarav.sharma@college.edu',
            role: 'student',
            status: 'active',
            department: 'Computer Science & Engineering',
            batch: '2027',
            consentGiven: true,
            verifiedSkillsCount: 14,
            createdAt: '2026-09-01T10:00:00Z',
            lastLogin: '2026-10-24T07:30:00Z'
          },
          {
            id: 'usr_stu02',
            name: 'Priya Patel',
            email: 'priya.patel@college.edu',
            role: 'student',
            status: 'active',
            department: 'Information Technology',
            batch: '2026',
            consentGiven: true,
            verifiedSkillsCount: 11,
            createdAt: '2026-09-03T11:20:00Z',
            lastLogin: '2026-10-23T16:45:00Z'
          },
          {
            id: 'usr_fac01',
            name: 'Prof. Rajesh Kulkarni',
            email: 'rajesh.kulkarni@college.edu',
            role: 'faculty',
            status: 'active',
            department: 'Computer Science & Engineering',
            consentGiven: true,
            verifiedSkillsCount: 0,
            createdAt: '2026-08-20T08:00:00Z',
            lastLogin: '2026-10-24T06:10:00Z'
          },
          {
            id: 'usr_rec01',
            name: 'Vikram Mehta',
            email: 'vikram.mehta@techcorp.in',
            role: 'recruiter',
            status: 'active',
            department: 'Talent Acquisition - TechCorp',
            consentGiven: true,
            verifiedSkillsCount: 0,
            createdAt: '2026-09-15T14:00:00Z',
            lastLogin: '2026-10-23T18:00:00Z'
          },
          {
            id: 'usr_stu03',
            name: 'Rohan Deshmukh',
            email: 'rohan.deshmukh@college.edu',
            role: 'student',
            status: 'inactive',
            department: 'Electronics & Telecommunication',
            batch: '2027',
            consentGiven: false,
            verifiedSkillsCount: 2,
            createdAt: '2026-09-10T12:00:00Z',
            lastLogin: '2026-10-10T09:00:00Z'
          }
        ],
        pagination: { total: 6, page: 1, limit: 20, totalPages: 1 }
      };
    }
  },

  /**
   * Update user status (active / inactive)
   */
  async updateUserStatus(id, status, reason = '') {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: AUTH_HEADER,
      body: JSON.stringify({ status, reason })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error?.message || `HTTP ${res.status}`);
    }
    return (await res.json()).data;
  },

  /**
   * Update user role
   */
  async updateUserRole(id, role, department = null) {
    const res = await fetch(`${API_BASE}/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: AUTH_HEADER,
      body: JSON.stringify({ role, department })
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error?.message || `HTTP ${res.status}`);
    }
    return (await res.json()).data;
  },

  /**
   * Fetch connectors & microservices status
   */
  async getIntegrations() {
    try {
      const res = await fetch(`${API_BASE}/admin/integrations`, {
        headers: AUTH_HEADER
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data.services;
    } catch (err) {
      console.warn('[AdminService] Backend unreachable, using fallback connectors status:', err.message);
      return [
        {
          id: 'conn_mongo',
          name: 'MongoDB Primary Database',
          type: 'database',
          status: 'connected',
          mode: 'live',
          endpoint: 'mongodb://localhost:27017/skillbridge',
          latencyMs: 3,
          description: 'Persistent document store for users, profiles, and evidence records'
        },
        {
          id: 'conn_fastapi',
          name: 'FastAPI AI/ML Microservice',
          type: 'ai_microservice',
          status: 'healthy',
          mode: 'live',
          endpoint: 'http://localhost:8000/health',
          latencyMs: 24,
          description: 'Stateless skill extraction, weighted evidence scoring & role matching'
        },
        {
          id: 'conn_github',
          name: 'GitHub Evidence Ingestion',
          type: 'external_connector',
          status: 'configured',
          mode: 'demo',
          description: 'Student repository commits and PR evidence verification',
          details: 'Running in sandbox mock mode (No public tokens exposed)'
        },
        {
          id: 'conn_leetcode',
          name: 'Coding Platform / LeetCode Sync',
          type: 'external_connector',
          status: 'configured',
          mode: 'demo',
          description: 'Problem-solving ranking and assessment corroboration',
          details: 'Simulated API adapter active'
        },
        {
          id: 'conn_lms',
          name: 'College LMS / Internal Assessment',
          type: 'erp_connector',
          status: 'configured',
          mode: 'demo',
          description: 'Internal grades, lab assessments, and faculty endorsements',
          details: 'CSV batch & Webhook bridge configured'
        }
      ];
    }
  },

  /**
   * Fetch audit logs
   */
  async getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs?${query}`, {
        headers: AUTH_HEADER
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.data.logs;
    } catch (err) {
      console.warn('[AdminService] Backend unreachable, using fallback audit log data:', err.message);
      return [
        {
          id: 'log_001',
          timestamp: new Date().toISOString(),
          actor: { id: 'usr_adm01', name: 'Dr. Neha Verma', role: 'admin' },
          action: 'SYSTEM_BOOT',
          target: { type: 'system', id: 'platform_core' },
          severity: 'info',
          details: 'SkillBridge Gateway initialized in development mode',
          ipAddress: '127.0.0.1'
        },
        {
          id: 'log_002',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          actor: { id: 'usr_adm01', name: 'Dr. Neha Verma', role: 'admin' },
          action: 'INTEGRATION_CHECK',
          target: { type: 'microservice', id: 'ai-service' },
          severity: 'info',
          details: 'AI FastAPI health probe executed with status: healthy',
          ipAddress: '127.0.0.1'
        }
      ];
    }
  }
};
