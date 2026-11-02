/**
 * AuditLog Model
 * Records immutable audit trail of administrative modifications, role changes, and security events.
 */

const initialAuditLogs = [
  {
    id: 'log_001',
    timestamp: new Date('2026-10-24T06:30:15Z'),
    actor: { id: 'usr_adm01', name: 'Dr. Neha Verma', role: 'admin' },
    action: 'SYSTEM_BOOT',
    target: { type: 'system', id: 'platform_core' },
    severity: 'info',
    details: 'SkillBridge Express Gateway initialized in development mode',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'log_002',
    timestamp: new Date('2026-10-24T07:15:00Z'),
    actor: { id: 'usr_adm01', name: 'Dr. Neha Verma', role: 'admin' },
    action: 'INTEGRATION_CHECK',
    target: { type: 'microservice', id: 'ai-service' },
    severity: 'info',
    details: 'AI FastAPI health probe executed with status: healthy',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'log_003',
    timestamp: new Date('2026-10-24T07:45:22Z'),
    actor: { id: 'usr_adm01', name: 'Dr. Neha Verma', role: 'admin' },
    action: 'USER_STATUS_UPDATE',
    target: { type: 'user', id: 'usr_stu03' },
    severity: 'warning',
    details: 'Account set to inactive pending consent and document re-submission',
    ipAddress: '127.0.0.1'
  }
];

class AuditLogRepository {
  constructor() {
    this.logs = [...initialAuditLogs];
  }

  async record({ actor, action, target, severity = 'info', details, ipAddress = '127.0.0.1' }) {
    const entry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date(),
      actor: actor || { id: 'system', name: 'System Process', role: 'system' },
      action,
      target: target || { type: 'general', id: 'unknown' },
      severity,
      details,
      ipAddress
    };
    this.logs.unshift(entry); // Most recent first
    return entry;
  }

  async find(filter = {}) {
    let list = [...this.logs];
    if (filter.severity) {
      list = list.filter(l => l.severity === filter.severity);
    }
    if (filter.action) {
      list = list.filter(l => l.action === filter.action);
    }
    const limit = filter.limit ? parseInt(filter.limit, 10) : 50;
    return list.slice(0, limit);
  }

  async resetSeed() {
    this.logs = [...initialAuditLogs];
  }
}

export const AuditLogModel = new AuditLogRepository();
