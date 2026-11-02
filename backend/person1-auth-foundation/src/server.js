require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters long.");
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`SkillBridge API running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
