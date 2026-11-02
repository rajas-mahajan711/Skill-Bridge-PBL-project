const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const { ROLES } = require("../constants/roles");
const { listUsers } = require("../controllers/userController");

const router = express.Router();

// Demonstration of a protected, Admin-only endpoint.
router.get("/", authenticate, authorize(ROLES.ADMIN), listUsers);

module.exports = router;
