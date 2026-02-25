import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api";

async function testLoginAsMember() {
  try {
    console.log("🧪 Testing Login as Member Feature\n");

    // Test 1: Try login as member without admin context
    console.log("Test 1: Login as member (no admin context)");
    const response1 = await fetch(`${API_BASE}/auth/login-as-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: 2,
        admin_id: 1,
      }),
    });
    const result1 = await response1.json();
    console.log("Status:", response1.status);
    console.log("Response:", result1);
    console.log("---\n");

    // Test 2: Verify endpoint exists
    console.log("Test 2: Verify endpoint responds");
    const response2 = await fetch(`${API_BASE}/auth/login-as-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: 5,
      }),
    });
    const result2 = await response2.json();
    console.log("Status:", response2.status);
    console.log("Response:", result2);
    console.log("---\n");

    console.log("✅ Endpoint test complete");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testLoginAsMember();
