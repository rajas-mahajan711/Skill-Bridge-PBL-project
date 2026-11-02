const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin/users", userRoutes);

module.exports = router;
