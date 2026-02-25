import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api";

async function testAttendanceFlow() {
  console.log("🧪 ATTENDANCE API TEST FLOW\n");

  try {
    // Test 1: Submit Attendance for Today
    console.log("Test 1️⃣ - Submitting attendance for today...\n");

    // Get today's date in DD/MM/YYYY format
    const now = new Date();
    const today = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;

    const payload = {
      date: today,
      time: "09:00",
      shift: "Morning",
      members: [
        {
          id: 1,
          name: "Test Member",
          category: "Video Satsang",
          stat_category: "Initiated",
        },
        {
          id: 2,
          name: "Another Member",
          category: "Audio Satsang",
          stat_category: "Devotee",
        },
      ],
    };

    console.log("📤 Request Payload:");
    console.log(JSON.stringify(payload, null, 2));

    const submitResponse = await fetch(`${API_BASE}/attendance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const submitData = await submitResponse.json();
    console.log("\n📥 Response Status:", submitResponse.status);
    console.log("Response Data:");
    console.log(JSON.stringify(submitData, null, 2));

    if (!submitResponse.ok) {
      console.log("❌ Failed to submit attendance");
      process.exit(1);
    }

    console.log("✅ Attendance submitted successfully\n");

    // Test 2: Fetch All Attendance
    console.log("Test 2️⃣ - Fetching all attendance records...\n");

    const getResponse = await fetch(`${API_BASE}/attendance`);
    const attendanceData = await getResponse.json();

    if (!getResponse.ok || !attendanceData.success) {
      console.log("❌ Failed to fetch attendance");
      process.exit(1);
    }

    console.log(`✅ Fetched ${attendanceData.data.length} attendance records`);

    // Show first 3 records with date fields
    console.log("\n📋 First 3 records (with date columns):");
    attendanceData.data.slice(0, 3).forEach((record, idx) => {
      console.log(`\nRecord ${idx + 1}:`);
      console.log(`  ID: ${record.id}`);
      console.log(`  Date: ${record.date}`);
      console.log(`  Time: ${record.time}`);
      console.log(`  Shift: ${record.shift}`);
      console.log(`  dt: ${record.dt || "❌ NULL"}`);
      console.log(`  day: ${record.day || "❌ NULL"}`);
      console.log(`  month: ${record.month || "❌ NULL"}`);
      console.log(`  year: ${record.year || "❌ NULL"}`);
      console.log(`  Members: ${record.members.length}`);
    });

    // Check if date columns are populated
    const recentRecords = attendanceData.data.slice(0, 5);
    const hasValidDateCols = recentRecords.some(
      (r) => r.dt && r.day && r.month && r.year
    );

    if (hasValidDateCols) {
      console.log("\n✅ SUCCESS! Date columns are being populated!");
    } else {
      console.log(
        "\n⚠️  WARNING: Date columns still showing NULL. This might indicate:"
      );
      console.log("  1. Recent records haven't been inserted yet");
      console.log("  2. INSERT statement is still not including these columns");
      console.log("  3. Database columns may not exist");
    }

    console.log("\n✅ Test completed successfully\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during test:");
    console.error(error.message);
    if (error.code === "ECONNREFUSED") {
      console.error("\n⚠️  Cannot connect to backend at http://localhost:5000");
      console.error("Make sure the backend server is running!");
    }
    process.exit(1);
  }
}

// Make sure backend is accessible first
console.log("🔍 Checking if backend is running...\n");

fetch(`${API_BASE}/health`)
  .then((r) => {
    if (r.ok) {
      console.log("✅ Backend is running\n");
      testAttendanceFlow();
    } else {
      throw new Error("Health check failed");
    }
  })
  .catch(() => {
    console.log("❌ Backend is NOT running at http://localhost:5000");
    console.log("\nPlease start the backend first:");
    console.log(
      '  cd "c:\\Users\\karti\\OneDrive\\Desktop\\RADHA SWAMI\\Backend"'
    );
    console.log("  npm start\n");
    process.exit(1);
  });
