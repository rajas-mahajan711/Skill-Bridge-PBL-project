/**
 * Admin Routes
 * Protected endpoints for platform administration, user governance, audit logs, and integration health.
 */
import { AdminController } from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/roleMiddleware.js';
import { validateStatusUpdate, validateRoleUpdate } from '../validators/adminValidator.js';

export function setupAdminRoutes(router) {
  // All admin routes require authentication and the 'admin' role
  router.get('/admin/overview', authMiddleware, requireRole('admin'), AdminController.getOverview);
  router.get('/admin/users', authMiddleware, requireRole('admin'), AdminController.getUsers);
  router.get('/admin/users/:id', authMiddleware, requireRole('admin'), AdminController.getUserById);
  router.patch('/admin/users/:id/status', authMiddleware, requireRole('admin'), validateStatusUpdate, AdminController.updateUserStatus);
  router.patch('/admin/users/:id/role', authMiddleware, requireRole('admin'), validateRoleUpdate, AdminController.updateUserRole);
  router.get('/admin/integrations', authMiddleware, requireRole('admin'), AdminController.getIntegrations);
  router.get('/admin/audit-logs', authMiddleware, requireRole('admin'), AdminController.getAuditLogs);
}
