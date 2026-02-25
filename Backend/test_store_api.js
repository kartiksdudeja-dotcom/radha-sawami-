import fetch from "node-fetch";

const API_BASE = "http://localhost:5000/api";

async function testStoreAPI() {
  console.log(
    "\n╔════════════════════════════════════════════════════════════╗"
  );
  console.log("║          STORE API TEST - All Endpoints                  ║");
  console.log(
    "╚════════════════════════════════════════════════════════════╝\n"
  );

  try {
    // Test 1: Get all items
    console.log("📦 TEST 1: Get All Store Items");
    let res = await fetch(`${API_BASE}/store/items`);
    let data = await res.json();
    console.log(`   Status: ${data.success ? "✅" : "❌"}`);
    console.log(`   Items Count: ${data.count || 0}\n`);

    // Test 2: Create new item
    console.log("📦 TEST 2: Create New Store Item");
    res = await fetch(`${API_BASE}/store/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ItemName: "Test Product",
        Description: "Test product description",
        Category: "Test Category",
        Price: 500,
        Quantity: 10,
        Unit: "Piece",
      }),
    });
    data = await res.json();
    console.log(`   Status: ${data.success ? "✅" : "❌"}`);
    console.log(`   Message: ${data.message || data.error}\n`);

    // Test 3: Get all orders
    console.log("📦 TEST 3: Get All Orders");
    res = await fetch(`${API_BASE}/store/orders`);
    data = await res.json();
    console.log(`   Status: ${data.success ? "✅" : "❌"}`);
    console.log(`   Orders Count: ${data.count || 0}\n`);

    // Test 4: Get all sales
    console.log("📦 TEST 4: Get All Sales");
    res = await fetch(`${API_BASE}/store/sales`);
    data = await res.json();
    console.log(`   Status: ${data.success ? "✅" : "❌"}`);
    console.log(`   Sales Count: ${data.count || 0}\n`);

    // Test 5: Get inventory summary
    console.log("📦 TEST 5: Get Inventory Summary");
    res = await fetch(`${API_BASE}/store/inventory-summary`);
    data = await res.json();
    console.log(`   Status: ${data.success ? "✅" : "❌"}`);
    console.log(`   Items: ${data.data ? data.data.length : 0}\n`);

    console.log(
      "╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║            ✅ ALL STORE API TESTS COMPLETED               ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝\n"
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  }
}

testStoreAPI();
