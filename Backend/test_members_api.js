import fetch from "node-fetch";

console.log("🔍 Testing Members API...\n");

async function testAPI() {
  try {
    // Wait for server to start
    await new Promise((r) => setTimeout(r, 3000));

    console.log("📡 Calling: http://localhost:5000/api/members");
    const response = await fetch("http://localhost:5000/api/members");

    console.log(`✅ Status: ${response.status}`);

    const text = await response.text();
    console.log(`📊 Response length: ${text.length} characters\n`);
    console.log("📋 First 500 chars of response:");
    console.log(text.substring(0, 500));

    // Try to parse
    try {
      const data = JSON.parse(text);
      console.log(`\n✅ JSON parsed successfully!`);
      console.log(`✅ success: ${data.success}`);
      console.log(`✅ Members count: ${data.data?.length || 0}`);
      if (data.data && data.data.length > 0) {
        console.log(
          `✅ First member:`,
          JSON.stringify(data.data[0], null, 2).substring(0, 300)
        );
      }
    } catch (parseError) {
      console.log(`❌ JSON Parse Error: ${parseError.message}`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
  process.exit(0);
}

testAPI();
