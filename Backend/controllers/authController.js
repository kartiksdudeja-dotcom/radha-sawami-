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
        `SELECT TOP 1 UserID, UserName, Password, Name, ChkAdmin, CanManageAttendance, CanManageStore FROM MemberDetails WHERE UserName = @username`
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
    const isAdmin = user.ChkAdmin === true || user.ChkAdmin === 1 ? true : false;
    const canManageAttendance = user.CanManageAttendance === true || user.CanManageAttendance === 1 ? true : false;
    const canManageStore = user.CanManageStore === true || user.CanManageStore === 1 ? true : false;

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.UserID,
        name: user.Name.trim(),
        username: user.UserName.trim(),
        is_admin: isAdmin,
        can_manage_attendance: canManageAttendance,
        can_manage_store: canManageStore,
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
    const pool = await getPool();

    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        `SELECT UserID, UserName, Name, ChkAdmin, CanManageAttendance, CanManageStore FROM MemberDetails WHERE UserID = @userId`
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const user = result.recordset[0];
    const isAdmin = user.ChkAdmin === true || user.ChkAdmin === 1 ? true : false;
    const canManageAttendance = user.CanManageAttendance === true || user.CanManageAttendance === 1 ? true : false;
    const canManageStore = user.CanManageStore === true || user.CanManageStore === 1 ? true : false;

    res.json({
      success: true,
      user: {
        id: user.UserID,
        name: (user.Name || "").trim(),
        username: (user.UserName || "").trim(),
        is_admin: isAdmin,
        can_manage_attendance: canManageAttendance,
        can_manage_store: canManageStore,
      },
    });
  } catch (error) {
    console.error("GetUser error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Check User Role (Pre-login)
export const checkRole = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, error: "Username (UID) is required" });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(
        `SELECT TOP 1 UserID, UserName, ChkAdmin, CanManageAttendance, CanManageStore, Name FROM MemberDetails WHERE UserName = @username`
      );

    if (result.recordset.length === 0) {
      return res.json({ success: false, error: "User not found" });
    }

    const user = result.recordset[0];
    const isAdmin = 
      user.ChkAdmin === true || 
      user.ChkAdmin === 1 || 
      user.ChkAdmin === "1" || 
      String(user.ChkAdmin).toLowerCase() === "true";

    const canManageAttendance = 
      user.CanManageAttendance === true || 
      user.CanManageAttendance === 1 || 
      user.CanManageAttendance === "1" || 
      String(user.CanManageAttendance).toLowerCase() === "true";

    const canManageStore = 
      user.CanManageStore === true || 
      user.CanManageStore === 1 || 
      user.CanManageStore === "1" || 
      String(user.CanManageStore).toLowerCase() === "true";

    res.json({
      success: true,
      isAdmin,
      canManageAttendance,
      canManageStore,
      name: user.Name ? user.Name.trim() : ""
    });
  } catch (error) {
    console.error("Check role error:", error);
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
        `SELECT UserID, UserName, Name, Gender, CanManageAttendance, CanManageStore FROM MemberDetails WHERE UserID = @memberId`
      );

    if (memberResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Member not found" });
    }

    const member = memberResult.recordset[0];
    const canManageAttendance = member.CanManageAttendance === true || member.CanManageAttendance === 1 ? true : false;
    const canManageStore = member.CanManageStore === true || member.CanManageStore === 1 ? true : false;

    res.json({
      success: true,
      message: `Logged in as ${member.Name}`,
      user: {
        id: member.UserID,
        name: member.Name.trim(),
        username: member.UserName.trim(),
        is_admin: false,
        can_manage_attendance: canManageAttendance,
        can_manage_store: canManageStore,
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
        `SELECT UserID, UserName, Name, ChkAdmin, CanManageAttendance, CanManageStore FROM MemberDetails WHERE UserID = @userId`
      );

    if (adminResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Admin user not found" });
    }

    const adminUser = adminResult.recordset[0];
    const isAdmin =
      adminUser.ChkAdmin === true || adminUser.ChkAdmin === 1 ? true : false;
    const canManageAttendance = adminUser.CanManageAttendance === true || adminUser.CanManageAttendance === 1 ? true : false;
    const canManageStore = adminUser.CanManageStore === true || adminUser.CanManageStore === 1 ? true : false;

    res.json({
      success: true,
      message: "Returned to admin session",
      user: {
        id: adminUser.UserID,
        name: adminUser.Name.trim(),
        username: adminUser.UserName.trim(),
        is_admin: isAdmin,
        can_manage_attendance: canManageAttendance,
        can_manage_store: canManageStore,
      },
    });
  } catch (error) {
    console.error("Stop impersonating error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
