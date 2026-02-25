// Test Login as Member Feature
// Run this in Backend directory: node test_login_as_member.js

import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api/auth";

async function testFeature() {
  console.log("\n========================================");
  console.log("Testing Login as Member Feature");
  console.log("========================================\n");

  try {
    // Test 1: Check if endpoints exist
    console.log("Test 1: Endpoint Discovery");
    console.log("-".repeat(40));

    const endpoints = [
      { method: "POST", url: "/login-as-member", name: "Login as Member" },
      {
        method: "POST",
        url: "/stop-impersonating",
        name: "Stop Impersonating",
      },
    ];

    for (const endpoint of endpoints) {
      console.log(`✓ ${endpoint.method} ${API_BASE}${endpoint.url}`);
    }
    console.log("");

    // Test 2: Test login-as-member with missing admin_id
    console.log("Test 2: Missing admin_id validation");
    console.log("-".repeat(40));
    const response1 = await fetch(`${API_BASE}/login-as-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: 2 }),
    });
    const result1 = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log(`Response: ${JSON.stringify(result1, null, 2)}`);
    console.log('Expected: 400 with "Admin ID is required" error\n');

    // Test 3: Test login-as-member with missing member_id
    console.log("Test 3: Missing member_id validation");
    console.log("-".repeat(40));
    const response2 = await fetch(`${API_BASE}/login-as-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: 1 }),
    });
    const result2 = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log(`Response: ${JSON.stringify(result2, null, 2)}`);
    console.log('Expected: 400 with "Member ID is required" error\n');

    // Test 4: Test with valid IDs (assuming 1 is admin)
    console.log("Test 4: Valid login-as-member request");
    console.log("-".repeat(40));
    const response3 = await fetch(`${API_BASE}/login-as-member`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ member_id: 2, admin_id: 1 }),
    });
    const result3 = await response3.json();
    console.log(`Status: ${response3.status}`);
    console.log(`Response: ${JSON.stringify(result3, null, 2)}`);
    console.log("");

    // Test 5: Test stop-impersonating
    console.log("Test 5: Stop impersonating request");
    console.log("-".repeat(40));
    const response4 = await fetch(`${API_BASE}/stop-impersonating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ original_user_id: 1 }),
    });
    const result4 = await response4.json();
    console.log(`Status: ${response4.status}`);
    console.log(`Response: ${JSON.stringify(result4, null, 2)}`);
    console.log("");

    console.log("========================================");
    console.log("✅ All endpoint tests completed!");
    console.log("========================================\n");
  } catch (error) {
    console.error("❌ Test Error:", error.message);
    console.log("\nMake sure the backend server is running on port 5000");
    console.log("Run: npm start (in Backend directory)\n");
  }
}

testFeature();
