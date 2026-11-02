require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");

async function createAdmin() {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_URI } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGODB_URI) {
    throw new Error("Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD and MONGODB_URI.");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("Admin password must be at least 12 characters.");
  }

  await mongoose.connect(MONGODB_URI);

  const email = ADMIN_EMAIL.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    throw new Error("A user with this admin email already exists. No changes made.");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  await User.create({
    name: ADMIN_NAME,
    email,
    passwordHash,
    role: ROLES.ADMIN
  });

  console.log("Admin account created successfully.");
}

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
