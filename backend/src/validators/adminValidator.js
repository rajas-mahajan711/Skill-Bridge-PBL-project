/**
 * Admin Request Validators
 */
import { UserRoles, UserStatuses } from '../models/User.js';

export const validateStatusUpdate = (req, res, next) => {
  const { status, reason } = req.body || {};

  if (!status) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Status field is required',
        details: { expectedValues: Object.values(UserStatuses) }
      }
    });
  }

  if (!Object.values(UserStatuses).includes(status)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Invalid status '${status}'. Must be one of: [${Object.values(UserStatuses).join(', ')}]`,
        details: null
      }
    });
  }

  next();
};

export const validateRoleUpdate = (req, res, next) => {
  const { role } = req.body || {};

  if (!role) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Role field is required',
        details: { expectedValues: Object.values(UserRoles) }
      }
    });
  }

  if (!Object.values(UserRoles).includes(role)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Invalid role '${role}'. Must be one of: [${Object.values(UserRoles).join(', ')}]`,
        details: null
      }
    });
  }

  next();
};
