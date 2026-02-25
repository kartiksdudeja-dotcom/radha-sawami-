import express from "express";
import {
  login,
  signup,
  getUser,
  loginAsMember,
  stopImpersonating,
} from "../controllers/authController.js";

const router = express.Router();

// Auth Routes
router.post("/login", login);
router.post("/signup", signup);
router.get("/user/:id", getUser);

// Admin Impersonation Routes
router.post("/login-as-member", loginAsMember);
router.post("/stop-impersonating", stopImpersonating);

export default router;
