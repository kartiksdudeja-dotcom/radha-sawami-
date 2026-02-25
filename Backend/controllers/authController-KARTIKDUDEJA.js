import { getPool } from "../config/db.js";

import bcrypt from "bcryptjs";

// User Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid username or password" });
    }

    // Find user in database
    const user = db
      .prepare("SELECT * FROM members WHERE username = ?")
      .get(username);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    }

    // Check password (compare with bcrypt hash)
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    }

    // Return user data with role
    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        is_admin: user.is_admin === 1,
        is_member: user.is_member === 1,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ success: false, error: "Invalid username or password" });
  }
};

// User Signup
export const signup = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    // Check if user exists
    const existingUser = db
      .prepare("SELECT * FROM members WHERE username = ?")
      .get(username);
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exists" });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const result = db
      .prepare(
        `
      INSERT INTO members (name, username, password, is_member, is_admin, status)
      VALUES (?, ?, ?, 1, 0, 'Initiated')
    `
      )
      .run(name, username, hashedPassword);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: result.lastInsertRowid,
        name: name,
        username: username,
        is_admin: false,
        is_member: true,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get User
export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = db.prepare("SELECT * FROM members WHERE id = ?").get(userId);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        is_admin: user.is_admin === 1,
        is_member: user.is_member === 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
