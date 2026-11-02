/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces server-side permissions for endpoints.
 */

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User authentication required before role evaluation',
          details: null
        }
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): [${allowedRoles.join(', ')}]`,
          details: {
            userRole: req.user.role,
            requiredRoles: allowedRoles
          }
        }
      });
    }

    next();
  };
};
