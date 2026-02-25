import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testAllAPIs() {
  console.log('\n========================================');
  console.log('🌐 API ENDPOINTS VERIFICATION');
  console.log('========================================\n');

  const tests = [
    { 
      name: 'Server Health', 
      method: 'GET',
      url: `http://localhost:5000/api/health`,
      description: 'Check if server is running'
    },
    { 
      name: 'Get Members List', 
      method: 'GET',
      url: `${BASE_URL}/members`,
      description: 'Fetch all members from database'
    },
    { 
      name: 'Get Attendance Records', 
      method: 'GET',
      url: `${BASE_URL}/attendance`,
      description: 'Fetch attendance records'
    },
    { 
      name: 'Get Seva Records', 
      method: 'GET',
      url: `${BASE_URL}/seva`,
      description: 'Fetch seva/service records'
    },
    { 
      name: 'Get Store Products', 
      method: 'GET',
      url: `${BASE_URL}/store/products`,
      description: 'Fetch store products'
    },
  ];

  for (const test of tests) {
    try {
      console.log(`⏳ ${test.name}`);
      console.log(`   ${test.description}`);
      
      const response = await fetch(test.url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        
        if (Array.isArray(data)) {
          console.log(`   📊 Records Found: ${data.length}`);
          if (data.length > 0) {
            console.log(`   📋 First Record Keys: ${Object.keys(data[0]).slice(0, 4).join(', ')}`);
          }
        } else if (data.status) {
          console.log(`   📝 ${data.status}`);
        } else {
          const keys = Object.keys(data).slice(0, 3);
          console.log(`   📋 Response Keys: ${keys.join(', ')}`);
        }
      } else {
        console.log(`   ⚠️  Status: ${response.status} ${response.statusText}`);
      }
      console.log();
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('========================================');
  console.log('✨ API VERIFICATION COMPLETE');
  console.log('========================================\n');
}

// Wait for server and run tests
console.log('⏳ Waiting for server to be ready...\n');
setTimeout(testAllAPIs, 2000);
