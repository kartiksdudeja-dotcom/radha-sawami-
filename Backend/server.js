import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { initializeDatabase } from "./config/db.js";
import { initializePushNotifications } from "./utils/push_notifications.js";
import notificationRoutes from "./routes/notification_routes.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import sevaRoutes from "./routes/sevaRoutes.js";
import sevaMasterRoutes from "./routes/sevaMasterRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import supermanPhaseRoutes from "./routes/supermanPhaseRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  if (req.path === "/api/attendance" && req.method === "POST") {
    console.log("🔍 DEBUG - Attendance POST Request:");
    console.log("   Headers:", req.headers);
    console.log("   Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// Serve static files (profile photos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "✅ Server is running", timestamp: new Date() });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/seva", sevaRoutes);
app.use("/api/seva-master", sevaMasterRoutes);
app.use("/api/superman-phases", supermanPhaseRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/profile", profileRoutes);

// Initialize Web Push Notifications
console.log("🔔 Initializing Web Push Notifications...");
initializePushNotifications(
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
  process.env.VAPID_EMAIL
);

// Register Notification Routes
app.use("/api", notificationRoutes);

// Initialize database and start server
(async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n✅ Radha Swami Backend is running!");
      console.log(`🖥️  Local: http://localhost:${PORT}`);
      console.log(`📱 Network: http://10.45.236.80:${PORT}`);
      console.log(`📝 API Health Check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
})();
