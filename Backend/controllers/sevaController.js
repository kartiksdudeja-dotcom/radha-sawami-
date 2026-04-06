import { getPool } from "../config/db.js";

import sql from "mssql";

// Save seva entry
export const saveSevaEntry = async (req, res) => {
  try {
    const pool = await getPool();
    const { member_id, category, seva_name, hours, cost, date } = req.body;

    if (!member_id || !category || !seva_name) {
      return res.status(400).json({
        success: false,
        error: "Member, category and seva name are required",
      });
    }

    const result = await pool
      .request()
      .input("member_id", sql.Int, member_id)
      .input("category", sql.NVarChar, category)
      .input("seva_name", sql.NVarChar, seva_name)
      .input("hours", sql.Float, hours || 0)
      .input("cost", sql.Float, cost || 0)
      .input(
        "date",
        sql.NVarChar,
        date || new Date().toISOString().split("T")[0]
      ).query(`
        INSERT INTO Seva (UserID, SevaCategory, SevaName, Hours, Cost, SevaDate)
        VALUES (@member_id, @category, @seva_name, @hours, @cost, @date);
        SELECT SCOPE_IDENTITY() as id;
      `);

    res.status(201).json({
      success: true,
      data: {
        id: result.recordset[0].id,
        member_id,
        category,
        seva_name,
        hours,
        cost,
        date,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all seva entries (from saved Seva records)
export const getAllSevaEntries = async (req, res) => {
  try {
    const pool = await getPool();

    // Query from Seva table with member details
    const result = await pool.request().query(`
      SELECT 
        s.SevaId as id,
        s.UserID as member_id,
        m.Name as member_name,
        s.SevaCategory as category,
        s.SevaName as seva_name,
        s.Hours as hours,
        s.Cost as cost,
        s.SevaDate as date,
        s.CreatedAt as created_at
      FROM Seva s
      LEFT JOIN MemberDetails m ON s.UserID = m.UserID
      ORDER BY s.CreatedAt DESC
    `);

    console.log(`📊 Fetched ${result.recordset.length} seva entries`);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    console.error("Error fetching seva entries:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get seva entries by member
export const getSevaEntriesByMember = async (req, res) => {
  try {
    const pool = await getPool();
    const { memberId } = req.params;
    const result = await pool.request().input("memberId", sql.Int, memberId)
      .query(`
        SELECT 
          s.SevaId as id,
          s.UserID as member_id,
          m.Name as member_name,
          s.SevaCategory as category,
          s.SevaName as seva_name,
          s.Hours as hours,
          s.Cost as cost,
          s.SevaDate as date,
          s.CreatedAt as created_at
        FROM Seva s
        LEFT JOIN MemberDetails m ON s.UserID = m.UserID
        WHERE s.UserID = @memberId 
        ORDER BY s.CreatedAt DESC
      `);
    res.json({ success: true, data: result.recordset });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get seva report - fetches actual data from Seva table with category details
export const getSevaReport = async (req, res) => {
  try {
    const pool = await getPool();
    const { fromDate, toDate } = req.query;

    let query = `
      SELECT TOP 10000
        s.SevaId as id,
        s.UserID as member_id,
        m.Name as memberName,
        m.Status as status,
        m.Gender as gender,
        m.DOB as dateOfBirth,
        m.Initital as title,
        m.Association_member as association,
        s.SevaCategory as category,
        s.SevaName as seva_name,
        s.Hours as hours,
        s.Cost as cost,
        s.SevaDate as date,
        s.CreatedAt as created_at
      FROM Seva s
      LEFT JOIN MemberDetails m ON s.UserID = m.UserID
      WHERE 1=1
    `;

    const request = pool.request();

    // Date filter — SevaDate stored as YYYY-MM-DD
    if (fromDate && toDate) {
      query += ` AND s.SevaDate >= @fromDate AND s.SevaDate <= @toDate`;
      request.input("fromDate", sql.NVarChar, fromDate);
      request.input("toDate", sql.NVarChar, toDate);
      console.log(`🔍 Seva date filter: ${fromDate} to ${toDate}`);
    }

    if (req.query.memberId) {
      query += ` AND s.UserID = @memberId`;
      request.input("memberId", sql.Int, req.query.memberId);
    }

    query += ` ORDER BY s.SevaDate DESC, s.SevaId DESC`;

    const result = await request.query(query);
    console.log(`📊 Fetched ${result.recordset.length} seva records from Seva table`);

    const reportData = result.recordset.map((record) => ({
      id: record.id,
      member_id: record.member_id,
      memberName: record.memberName?.trim() || "Member",
      title: record.title?.trim() || "-",
      status: record.status?.trim() || "-",
      dateOfBirth: record.dateOfBirth?.trim() || "-",
      gender: record.gender?.trim() || "-",
      association: record.association?.trim() || "-",
      category: record.category?.trim() || "-",
      seva_name: record.seva_name?.trim() || "-",
      hours: record.hours || 0,
      cost: record.cost || 0,
      date: record.date || "-",
    }));

    res.json({ success: true, data: reportData });
  } catch (error) {
    console.error("Error fetching seva report:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete seva entry
export const deleteSevaEntry = async (req, res) => {
  try {
    const pool = await getPool();
    const { id } = req.params;

    await pool
      .request()
      .input("id", sql.Int, id)
      .query(`DELETE FROM Seva WHERE SevaID = @id`);

    res.json({ success: true, message: "Seva entry deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
