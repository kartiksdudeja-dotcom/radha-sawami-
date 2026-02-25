import { getPool } from "../config/db.js";
import sql from "mssql";

// Get all seva options
export const getSevaOptions = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT ID, Category, SevaName FROM SevaMaster ORDER BY Category, SevaName");
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching seva options:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Add new seva option
export const addSevaOption = async (req, res) => {
  try {
    const { category, sevaName } = req.body;
    if (!category || !sevaName) {
      return res.status(400).json({ success: false, error: "Category and Seva Name are required" });
    }

    const pool = await getPool();
    const result = await pool.request()
      .input("category", sql.NVarChar, category)
      .input("sevaName", sql.NVarChar, sevaName)
      .query("INSERT INTO SevaMaster (Category, SevaName) VALUES (@category, @sevaName); SELECT SCOPE_IDENTITY() as id");

    res.status(201).json({ 
      success: true, 
      data: { id: result.recordset[0].id, category, sevaName } 
    });
  } catch (error) {
    console.error("Error adding seva option:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete seva option
export const deleteSevaOption = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await getPool();
    await pool.request()
      .input("id", sql.Int, id)
      .query("DELETE FROM SevaMaster WHERE ID = @id");
    
    res.json({ success: true, message: "Seva option deleted successfully" });
  } catch (error) {
    console.error("Error deleting seva option:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
