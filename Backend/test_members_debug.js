#!/usr/bin/env node

/**
 * Debug Script: Test /api/members Endpoint
 * Run: node test_members_debug.js
 */

import fetch from "node-fetch";

const API_BASE = process.env.API_BASE || "http://localhost:5000";

async function testMembersAPI() {
  console.log("\n====================================");
  console.log("Testing /api/members Endpoint");
  console.log("====================================\n");

  try {
    console.log(`📡 Fetching from: ${API_BASE}/api/members\n`);

    const response = await fetch(`${API_BASE}/api/members`);

    console.log(
      `📊 Response Status: ${response.status} ${response.statusText}`
    );
    console.log(`📋 Response Headers:`);
    response.headers.forEach((value, name) => {
      console.log(`   ${name}: ${value}`);
    });

    const data = await response.json();

    console.log(`\n✅ Response Body:`);
    console.log(JSON.stringify(data, null, 2).substring(0, 1000) + "...\n");

    if (data.success && data.data) {
      console.log(`📊 Total Members: ${data.data.length}`);

      if (data.data.length > 0) {
        console.log(`\n📋 Sample Member Structure:`);
        console.log(JSON.stringify(data.data[0], null, 2));

        console.log(`\n🔍 Available Fields:`);
        Object.keys(data.data[0]).forEach((key) => {
          console.log(`   - ${key}: ${data.data[0][key]}`);
        });

        // Test search functionality
        console.log(`\n\n🧪 Search Test:`);
        const searchTerm = "khanna";
        const results = data.data.filter(
          (m) =>
            String(m.name || m.Name || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            String(m.username || m.UserName || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            String(m.number || m.Number || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
        );
        console.log(`Search "${searchTerm}": Found ${results.length} results`);
        if (results.length > 0) {
          results.slice(0, 3).forEach((m) => {
            console.log(`  ✓ ${m.name || m.Name} (ID: ${m.id || m.UserID})`);
          });
        }
      }
    } else {
      console.log("⚠️  Unexpected response format:", data);
    }

    console.log("\n====================================");
    console.log("✅ Test Complete");
    console.log("====================================\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("\n💡 Troubleshooting:");
    console.log("   1. Is the backend running? npm start");
    console.log("   2. Is it on port 5000?");
    console.log("   3. Is the database connected?");
    console.log("\n");
  }
}

testMembersAPI();
