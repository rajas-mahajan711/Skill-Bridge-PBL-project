/**
 * Admin Controller
 * Implements business logic for platform administration, user governance, audit logging, and integration monitoring.
 */
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { SystemMetricService } from '../models/SystemMetric.js';
import { AIServiceClient } from '../services/aiServiceClient.js';

export class AdminController {
  /**
   * GET /api/v1/admin/overview
   */
  static async getOverview(req, res, next) {
    try {
      const overview = await SystemMetricService.getOverviewMetrics();
      
      // Compute live user counts from model
      overview.metrics.totalStudents = await UserModel.count({ role: 'student' });
      overview.metrics.totalFaculty = await UserModel.count({ role: 'faculty' });
      overview.metrics.totalRecruiters = await UserModel.count({ role: 'recruiter' });
      overview.metrics.totalAdmins = await UserModel.count({ role: 'admin' });

      return res.status(200).json({
        success: true,
        data: overview,
        meta: {
          timestamp: new Date().toISOString(),
          requestedBy: req.user?.id
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users
   */
  static async getUsers(req, res, next) {
    try {
      const { role, status, search, page = 1, limit = 20 } = req.query;

      const filter = {};
      if (role) filter.role = role;
      if (status) filter.status = status;
      if (search) filter.search = search;

      const allUsers = await UserModel.find(filter);
      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, parseInt(limit, 10));
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedUsers = allUsers.slice(startIndex, startIndex + limitNum);

      return res.status(200).json({
        success: true,
        data: {
          users: paginatedUsers,
          pagination: {
            total: allUsers.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(allUsers.length / limitNum) || 1
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/users/:id
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID '${id}' was not found`,
            details: null
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   */
  static async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID '${id}' does not exist`,
            details: null
          }
        });
      }

      const updatedUser = await UserModel.updateStatus(id, status);

      // Record immutable audit log
      const auditLog = await AuditLogModel.record({
        actor: {
          id: req.user?.id || 'admin_sys',
          name: req.user?.name || 'Administrator',
          role: req.user?.role || 'admin'
        },
        action: 'USER_STATUS_UPDATE',
        target: { type: 'user', id: updatedUser.id },
        severity: status === 'inactive' ? 'warning' : 'info',
        details: `User status changed from '${existingUser.status}' to '${status}'. ${reason ? 'Reason: ' + reason : ''}`,
        ipAddress: req.ip || req.socket?.remoteAddress || '127.0.0.1'
      });

      return res.status(200).json({
        success: true,
        data: {
          user: updatedUser,
          auditLogId: auditLog.id
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/role
   */
  static async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role, department } = req.body;

      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: `User with ID '${id}' does not exist`,
            details: null
          }
        });
      }

      const updatedUser = await UserModel.updateRole(id, role, department);

      // Record audit log
      const auditLog = await AuditLogModel.record({
        actor: {
          id: req.user?.id || 'admin_sys',
          name: req.user?.name || 'Administrator',
          role: req.user?.role || 'admin'
        },
        action: 'USER_ROLE_UPDATE',
        target: { type: 'user', id: updatedUser.id },
        severity: 'critical',
        details: `User role modified from '${existingUser.role}' to '${role}'`,
        ipAddress: req.ip || req.socket?.remoteAddress || '127.0.0.1'
      });

      return res.status(200).json({
        success: true,
        data: {
          user: updatedUser,
          auditLogId: auditLog.id
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/integrations
   */
  static async getIntegrations(req, res, next) {
    try {
      const connectors = await AIServiceClient.getConnectorStatuses();

      return res.status(200).json({
        success: true,
        data: {
          services: connectors,
          evaluatedAt: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { severity, action, limit = 50 } = req.query;
      const logs = await AuditLogModel.find({ severity, action, limit });

      return res.status(200).json({
        success: true,
        data: {
          logs,
          total: logs.length
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
