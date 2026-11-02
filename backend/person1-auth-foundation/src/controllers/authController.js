const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { ROLES } = require("../constants/roles");
const { createAccessToken } = require("../utils/token");

async function register(req, res) {
  const { name, email, password } = req.validated.body;

  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "An account with this email already exists."
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Public registration always creates a Student.
  // Privileged roles must never be self-selected by a public signup request.
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    role: ROLES.STUDENT
  });

  const token = createAccessToken(user);

  return res.status(201).json({
    success: true,
    message: "Registration successful.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
}

async function login(req, res) {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email: email.toLowerCase() })
    .select("+passwordHash");

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password."
    });
  }

  const token = createAccessToken(user);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
}

async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isActive: req.user.isActive,
        createdAt: req.user.createdAt
      }
    }
  });
}

module.exports = { register, login, getMe };
