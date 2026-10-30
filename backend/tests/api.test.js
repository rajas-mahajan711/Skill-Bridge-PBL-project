const request = require('supertest');
const app = require('../src/app');

describe('SkillBridge Backend REST API Tests', () => {
  describe('System & Health API', () => {
    it('GET /api/health should return system status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toContain('SkillBridge');
      expect(res.body).toHaveProperty('database');
    });

    it('GET /api/nonexistent should return 404', async () => {
      const res = await request(app).get('/api/nonexistent');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication Enforcement on Protected Routes', () => {
    it('GET /api/students/me without token should return 401 Unauthorized', async () => {
      const res = await request(app).get('/api/students/me');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Authentication required|token/i);
    });

    it('GET /api/students/me/dashboard without token should return 401', async () => {
      const res = await request(app).get('/api/students/me/dashboard');
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/evidence without token should return 401', async () => {
      const res = await request(app).get('/api/evidence');
      expect(res.statusCode).toBe(401);
    });

    it('POST /api/evidence without token should return 401', async () => {
      const res = await request(app)
        .post('/api/evidence')
        .send({ title: 'Test Project', type: 'project' });
      expect(res.statusCode).toBe(401);
    });

    it('GET /api/learning/resources without token should return 401', async () => {
      const res = await request(app).get('/api/learning/resources');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('Authentication Input Validation', () => {
    it('POST /api/auth/register should fail when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'incomplete@skillbridge.edu',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should fail with missing credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login with invalid email should return 401 or 503 if DB offline', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent_student_user@skillbridge.edu',
        password: 'Password123!',
      });
      expect([401, 503]).toContain(res.statusCode);
    });
  });

  describe('Upload File Size & Type Validation', () => {
    it('POST /api/evidence/upload without token should return 401', async () => {
      const res = await request(app).post('/api/evidence/upload');
      expect(res.statusCode).toBe(401);
    });
  });
});
