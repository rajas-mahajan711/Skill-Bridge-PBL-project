const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Provide a Bearer token."
    });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token."
    });
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: "User account not found or inactive."
    });
  }

  // Read the current role from the database, so role changes take effect immediately.
  req.user = user;
  next();
});

module.exports = authenticate;
