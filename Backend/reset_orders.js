import { getPool } from "./config/db.js";

async function resetOrders() {
  try {
    const pool = await getPool();

    console.log("🗑️  Deleting all orders...");
    
    // Delete all order items first
    await pool.request().query(`DELETE FROM StoreOrderItems`);
    console.log("✅ All order items deleted");

    // Delete all orders
    await pool.request().query(`DELETE FROM StoreOrders`);
    console.log("✅ All orders deleted");

    // Reset IDENTITY seed to start from 1
    await pool.request().query(`
      DBCC CHECKIDENT ('StoreOrders', RESEED, 0)
    `);
    console.log("✅ Order ID seed reset to 1");

    console.log("\n🎉 All orders cleared! Next order will be ID #1\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting orders:", error.message);
    process.exit(1);
  }
}

resetOrders();
