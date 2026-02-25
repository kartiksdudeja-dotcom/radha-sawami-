async function testAttendanceAPI() {
  try {
    console.log("🧪 Testing Attendance POST API...\n");

    const payload = {
      date: "2025-12-29",
      time: "09:00",
      shift: "Evening",
      members: [
        {
          id: 1,
          name: "Test Member",
          number: "001",
          username: "testuser",
          category: "Video Satsang",
          stat_category: "Initiated",
        },
      ],
    };

    console.log("📤 Sending payload:");
    console.log(JSON.stringify(payload, null, 2));

    const response = await fetch("http://localhost:5000/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    console.log(`\n📥 Response Status: ${response.status}`);
    console.log("Response Body:");
    console.log(text);

    if (response.ok) {
      const data = JSON.parse(text);
      console.log("\n✅ Success! Created records:", data.data.count);
    } else {
      console.log("\n❌ Failed! Error:", text);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testAttendanceAPI();
