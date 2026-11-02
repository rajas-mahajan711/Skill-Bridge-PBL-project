/**
 * SkillBridge Person 5 - Admin Console & RBAC Integration Tests
 * Run with: node --test backend/tests/admin.test.js
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../src/app.js';
import { UserModel } from '../src/models/User.js';
import { AuditLogModel } from '../src/models/AuditLog.js';

describe('SkillBridge Admin Console & Integration Gateway Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = createApp();
    server = http.createServer((req, res) => app.handleRequest(req, res));
    await new Promise((resolve) => {
      server.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await UserModel.resetSeed();
    await AuditLogModel.resetSeed();
  });

  test('1. System Health: GET /health returns 200 and status UP', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'UP');
    assert.ok(body.data.uptime >= 0);
  });

  test('2. RBAC Enforcement: Admin route without token returns 401 UNAUTHORIZED', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'UNAUTHORIZED');
  });

  test('3. RBAC Enforcement: Student token accessing admin route returns 403 FORBIDDEN', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { 'Authorization': 'Bearer mock-student-token' }
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'FORBIDDEN');
    assert.equal(body.error.details.userRole, 'student');
  });

  test('4. Admin Overview: Admin token returns platform counts, health, and breakdown', async () => {
    const res = await fetch(`${baseUrl}/admin/overview`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.metrics.totalStudents > 0);
    assert.ok(body.data.placementBreakdown);
    assert.equal(body.data.systemHealth.database, 'connected');
  });

  test('5. User Management: GET /admin/users returns sanitized user list (no passwords)', async () => {
    const res = await fetch(`${baseUrl}/admin/users`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.users.length > 0);

    for (const user of body.data.users) {
      assert.equal(user.password, undefined, 'Password must never be returned');
      assert.equal(user.passwordHash, undefined, 'Password hash must never be returned');
      assert.ok(user.id);
      assert.ok(user.email);
      assert.ok(user.role);
    }
  });

  test('6. User Filtering: GET /admin/users?role=student returns only students', async () => {
    const res = await fetch(`${baseUrl}/admin/users?role=student`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    for (const user of body.data.users) {
      assert.equal(user.role, 'student');
    }
  });

  test('7. User Detail: GET /admin/users/:id returns user or 404 for invalid ID', async () => {
    // Valid ID
    const res1 = await fetch(`${baseUrl}/admin/users/usr_stu01`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.data.name, 'Aarav Sharma');

    // Invalid ID
    const res2 = await fetch(`${baseUrl}/admin/users/non_existent_id`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    assert.equal(res2.status, 404);
  });

  test('8. Status Update & Audit Log: PATCH /admin/users/:id/status updates status and logs event', async () => {
    const res = await fetch(`${baseUrl}/admin/users/usr_stu02/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer mock-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'inactive',
        reason: 'Temporary suspension for documentation audit'
      })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.status, 'inactive');
    assert.ok(body.data.auditLogId);

    // Verify audit log has recorded the event
    const auditRes = await fetch(`${baseUrl}/admin/audit-logs`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    const auditBody = await auditRes.json();
    const recorded = auditBody.data.logs.find(l => l.id === body.data.auditLogId);
    assert.ok(recorded, 'Audit log entry must be present');
    assert.equal(recorded.action, 'USER_STATUS_UPDATE');
    assert.equal(recorded.severity, 'warning');
  });

  test('9. Status Update Validation: Invalid status yields 400 VALIDATION_ERROR', async () => {
    const res = await fetch(`${baseUrl}/admin/users/usr_stu02/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': 'Bearer mock-admin-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'disallowed_status'
      })
    });
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.error.code, 'VALIDATION_ERROR');
  });

  test('10. Integration Status Monitor: GET /admin/integrations reports connector modes', async () => {
    const res = await fetch(`${baseUrl}/admin/integrations`, {
      headers: { 'Authorization': 'Bearer mock-admin-token' }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.services));
    
    const dbService = body.data.services.find(s => s.type === 'database');
    assert.ok(dbService);
    assert.equal(dbService.status, 'connected');

    const aiService = body.data.services.find(s => s.type === 'ai_microservice');
    assert.ok(aiService);
    assert.ok(['healthy', 'offline'].includes(aiService.status));
  });
});
