import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testOrderCreation() {
  try {
    console.log('🚀 Starting order creation test\n');

    // Get available items
    console.log('1️⃣  Fetching store items...');
    const itemsResponse = await axios.get(`${API_URL}/store/items`);
    const items = itemsResponse.data;
    
    if (items.length === 0) {
      console.log('❌ No items available');
      return;
    }

    const item = items[0];
    console.log(`   Selected: ${item.ItemName} (ID: ${item.ItemID})`);
    console.log(`   Quantity before order: ${item.Quantity}\n`);

    // Create order
    console.log('2️⃣  Creating order...');
    const orderResponse = await axios.post(`${API_URL}/store/orders`, {
      MemberID: 1,
      Items: [
        {
          ItemID: item.ItemID,
          Quantity: 1,
          Price: item.Price
        }
      ]
    });

    console.log(`   ✅ Order created: ${orderResponse.data.OrderNumber}\n`);

    // Check updated quantity
    console.log('3️⃣  Checking inventory after order...');
    const updatedItemsResponse = await axios.get(`${API_URL}/store/items`);
    const updatedItem = updatedItemsResponse.data.find(i => i.ItemID === item.ItemID);
    
    console.log(`   Item: ${updatedItem.ItemName}`);
    console.log(`   Quantity after order: ${updatedItem.Quantity}`);
    console.log(`   Expected: ${item.Quantity - 1}\n`);

    if (updatedItem.Quantity === item.Quantity - 1) {
      console.log('✅ SUCCESS! Inventory was reduced correctly');
    } else {
      console.log('❌ FAILED! Inventory not reduced');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testOrderCreation();
