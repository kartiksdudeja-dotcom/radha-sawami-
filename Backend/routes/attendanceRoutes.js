import express from "express";
import {
  getAllAttendance,
  getAttendanceByDate,
  createAttendance,
  deleteAttendance,
  deleteMemberFromAttendance,
  updateAttendance,
  getMemberAttendanceStats,
} from "../controllers/attendanceController.js";

const router = express.Router();

// Get all attendance records
router.get("/", getAllAttendance);

// Get attendance by date
router.get("/by-date", getAttendanceByDate);

// Get member attendance stats for home page
router.get("/member-stats/:memberId", getMemberAttendanceStats);

// Create new attendance record
router.post("/", createAttendance);

// Update attendance record
router.put("/:id", updateAttendance);

// Delete attendance record
router.delete("/:id", deleteAttendance);

// Delete member from attendance
router.delete("/:attendanceId/member/:memberId", deleteMemberFromAttendance);

export default router;
