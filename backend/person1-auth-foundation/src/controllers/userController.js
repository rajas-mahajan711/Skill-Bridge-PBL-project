const User = require("../models/User");

async function listUsers(req, res) {
  const users = await User.find()
    .select("name email role isActive createdAt")
    .sort({ createdAt: -1 })
    .limit(100);

  res.status(200).json({
    success: true,
    data: { users }
  });
}

module.exports = { listUsers };
