import { getPool } from "../config/db.js";
import sql from "mssql";

// Get all superman phases
export const getPhases = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT * FROM SupermanPhases ORDER BY MinAge");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching superman phases:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add new superman phase
export const addPhase = async (req, res) => {
  try {
    const { phaseName, description, minAge, maxAge } = req.body;
    if (!phaseName) {
      return res.status(400).json({ success: false, error: "Phase Name is required" });
    }

    const pool = await getPool();
    await pool.request()
      .input("phaseName", sql.NVarChar, phaseName)
      .input("description", sql.NVarChar, description || "")
      .input("minAge", sql.Int, minAge || 0)
      .input("maxAge", sql.Int, maxAge || 150)
      .query("INSERT INTO SupermanPhases (PhaseName, Description, MinAge, MaxAge) VALUES (@phaseName, @description, @minAge, @maxAge)");

    res.status(201).json({ success: true, message: "Phase added successfully" });
  } catch (error) {
    console.error("Error adding superman phase:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update superman phase
export const updatePhase = async (req, res) => {
  try {
    const { id } = req.params;
    const { phaseName, description, minAge, maxAge } = req.body;

    const pool = await getPool();
    await pool.request()
      .input("id", sql.Int, id)
      .input("phaseName", sql.NVarChar, phaseName)
      .input("description", sql.NVarChar, description)
      .input("minAge", sql.Int, minAge)
      .input("maxAge", sql.Int, maxAge)
      .query("UPDATE SupermanPhases SET PhaseName = @phaseName, Description = @description, MinAge = @minAge, MaxAge = @maxAge WHERE ID = @id");

    res.json({ success: true, message: "Phase updated successfully" });
  } catch (error) {
    console.error("Error updating superman phase:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete superman phase
export const deletePhase = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM SupermanPhases WHERE ID = @id");

    res.json({ success: true, message: "Phase deleted successfully" });
  } catch (error) {
    console.error("Error deleting superman phase:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
