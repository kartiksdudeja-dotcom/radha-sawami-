import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAPIs() {
  console.log('\n🔍 Testing API Endpoints...\n');

  const tests = [
    { name: 'Health Check', url: 'http://localhost:5000/api/health' },
    { name: 'Get Members', url: `${BASE_URL}/members` },
    { name: 'Get Attendance', url: `${BASE_URL}/attendance` },
    { name: 'Get Seva', url: `${BASE_URL}/seva` },
    { name: 'Get Store Products', url: `${BASE_URL}/store/products` },
  ];

  for (const test of tests) {
    try {
      console.log(`⏳ Testing: ${test.name}`);
      const response = await fetch(test.url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${test.name} - Status: ${response.status}`);
        
        if (Array.isArray(data)) {
          console.log(`   Found ${data.length} records\n`);
        } else if (data.status) {
          console.log(`   ${data.status}\n`);
        } else {
          console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...\n`);
        }
      } else {
        console.log(`⚠️ ${test.name} - Status: ${response.status}\n`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}\n`);
    }
  }
}

// Wait for server to start
setTimeout(testAPIs, 2000);
