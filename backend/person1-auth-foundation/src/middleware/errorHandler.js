function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists."
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Database validation failed.",
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error." : err.message
  });
}

module.exports = errorHandler;
