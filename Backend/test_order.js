async function testOrderCreation() {
  try {
    console.log('🚀 Testing inventory reduction with new code\n');

    // Step 1: Get items
    console.log('1️⃣  Fetching store items...');
    const itemsResponse = await fetch('http://localhost:5000/api/store/items');
    const items = await itemsResponse.json();
    
    if (!Array.isArray(items) || items.length === 0) {
      console.log('❌ No items available');
      return;
    }

    const item = items.find(i => i.Quantity > 0);
    if (!item) {
      console.log('❌ No items with quantity > 0');
      return;
    }

    console.log(`   Selected: ${item.ItemName} (ID: ${item.ItemID})`);
    console.log(`   ✅ Quantity BEFORE order: ${item.Quantity}\n`);
    const quantityBefore = item.Quantity;

    // Step 2: Create order
    console.log('2️⃣  Creating order...');
    const orderResponse = await fetch('http://localhost:5000/api/store/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        MemberID: 1,
        Items: [
          {
            ItemID: item.ItemID,
            Quantity: 1,
            Price: item.Price
          }
        ]
      })
    });

    const orderData = await orderResponse.json();
    if (!orderData.success) {
      console.log('   ❌ Order creation failed:', orderData.error);
      return;
    }

    console.log(`   ✅ Order created: ${orderData.OrderNumber}\n`);

    // Wait a moment for database to update
    await new Promise(r => setTimeout(r, 1000));

    // Step 3: Check updated quantity
    console.log('3️⃣  Checking inventory AFTER order...');
    const updatedItemsResponse = await fetch('http://localhost:5000/api/store/items');
    const updatedItems = await updatedItemsResponse.json();
    const updatedItem = updatedItems.find(i => i.ItemID === item.ItemID);
    
    console.log(`   Item: ${updatedItem.ItemName}`);
    console.log(`   Quantity AFTER order: ${updatedItem.Quantity}`);
    console.log(`   Expected: ${quantityBefore - 1}\n`);

    if (updatedItem.Quantity === quantityBefore - 1) {
      console.log('✅✅✅ SUCCESS! Inventory was reduced correctly!');
    } else {
      console.log(`❌ FAILED! Expected ${quantityBefore - 1}, got ${updatedItem.Quantity}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrderCreation();
