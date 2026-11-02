/**
 * Global Safe Error Handling Middleware
 * Prevents credential leaks and ensures consistent JSON envelope.
 */

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error server-side
  console.error(`[SkillBridge Error] ${req.method} ${req.url}:`, err.message);

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred processing your request',
      details: isProduction ? null : err.details || null
    }
  });
};
