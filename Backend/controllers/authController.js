import { getPool } from "../config/db.js";

import sql from "mssql";
import bcrypt from "bcryptjs";

// User Login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Username and password are required" });
    }

    // Get SQL Server connection
    const pool = await getPool();

    // Query user from MemberDetails table
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(
        `SELECT TOP 1 UserID, UserName, Password, Name, ChkAdmin FROM MemberDetails WHERE UserName = @username`
      );

    if (result.recordset.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    }

    const user = result.recordset[0];

    // Check password - passwords stored as dates/strings in SQL, do direct comparison
    const isPasswordValid = password.trim() === user.Password.trim();

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid username or password" });
    }

    // Login successful
    console.log("User data from DB:", {
      UserID: user.UserID,
      ChkAdmin: user.ChkAdmin,
      ChkAdminType: typeof user.ChkAdmin,
    });
    const isAdmin =
      user.ChkAdmin === true || user.ChkAdmin === 1 ? true : false;
    console.log("Admin flag:", isAdmin);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.UserID,
        name: user.Name.trim(),
        username: user.UserName.trim(),
        is_admin: isAdmin,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// User Signup (if needed)
export const signup = async (req, res) => {
  try {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required" });
    }

    const pool = await getPool();

    // Check if user exists
    const checkUser = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT UserID FROM MemberDetails WHERE UserName = @username");

    if (checkUser.recordset.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "Username already exists" });
    }

    // Insert new user
    await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query(
        `INSERT INTO MemberDetails (Name, UserName, Password, ChkAdmin) VALUES (@name, @username, @password, 0)`
      );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
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
    const db = getDb();

    const user = db
      .prepare("SELECT id, name, username, is_admin FROM members WHERE id = ?")
      .get(userId);

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
      },
    });
  } catch (error) {
    console.error("GetUser error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Login as Member (Admin impersonation)
export const loginAsMember = async (req, res) => {
  try {
    const { member_id, admin_id } = req.body;

    if (!member_id) {
      return res
        .status(400)
        .json({ success: false, error: "Member ID is required" });
    }

    if (!admin_id) {
      return res
        .status(400)
        .json({ success: false, error: "Admin ID is required" });
    }

    // Get SQL Server connection
    const pool = await getPool();

    // Verify admin user
    const adminResult = await pool
      .request()
      .input("userId", sql.Int, admin_id)
      .query(
        `SELECT UserID, UserName, Name, ChkAdmin FROM MemberDetails WHERE UserID = @userId`
      );

    if (adminResult.recordset.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Admin user not found" });
    }

    const adminUser = adminResult.recordset[0];
    const isAdmin =
      adminUser.ChkAdmin === true || adminUser.ChkAdmin === 1 ? true : false;

    if (!isAdmin) {
      return res
        .status(403)
        .json({ success: false, error: "Only admins can login as members" });
    }

    // Get member details
    const memberResult = await pool
      .request()
      .input("memberId", sql.Int, member_id)
      .query(
        `SELECT UserID, UserName, Name, Gender FROM MemberDetails WHERE UserID = @memberId`
      );

    if (memberResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Member not found" });
    }

    const member = memberResult.recordset[0];

    res.json({
      success: true,
      message: `Logged in as ${member.Name}`,
      user: {
        id: member.UserID,
        name: member.Name.trim(),
        username: member.UserName.trim(),
        is_admin: false,
        is_impersonating: true,
        original_user_id: adminUser.UserID,
      },
    });
  } catch (error) {
    console.error("Login as member error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Stop Impersonating - Return to admin session
export const stopImpersonating = async (req, res) => {
  try {
    const { original_user_id } = req.body;

    if (!original_user_id) {
      return res
        .status(400)
        .json({ success: false, error: "Original user ID is required" });
    }

    const pool = await getPool();

    // Get admin user details
    const adminResult = await pool
      .request()
      .input("userId", sql.Int, original_user_id)
      .query(
        `SELECT UserID, UserName, Name, ChkAdmin FROM MemberDetails WHERE UserID = @userId`
      );

    if (adminResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Admin user not found" });
    }

    const adminUser = adminResult.recordset[0];
    const isAdmin =
      adminUser.ChkAdmin === true || adminUser.ChkAdmin === 1 ? true : false;

    res.json({
      success: true,
      message: "Returned to admin session",
      user: {
        id: adminUser.UserID,
        name: adminUser.Name.trim(),
        username: adminUser.UserName.trim(),
        is_admin: isAdmin,
      },
    });
  } catch (error) {
    console.error("Stop impersonating error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
