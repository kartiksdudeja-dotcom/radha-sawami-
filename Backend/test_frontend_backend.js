import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testDataFlow() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  🔄 FRONTEND ↔ BACKEND DATA FLOW TEST                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`,
      type: 'connection',
      description: 'Verify backend is running'
    },
    {
      name: 'Members Data',
      url: `${BASE_URL}/members`,
      type: 'data',
      description: 'Fetch all members from database'
    },
    {
      name: 'Attendance Data',
      url: `${BASE_URL}/attendance`,
      type: 'data',
      description: 'Fetch attendance records'
    },
    {
      name: 'Seva Data',
      url: `${BASE_URL}/seva`,
      type: 'data',
      description: 'Fetch seva records'
    }
  ];

  let successCount = 0;
  let failureCount = 0;

  for (const test of tests) {
    try {
      console.log(`⏳ ${test.name}`);
      console.log(`   └─ ${test.description}`);
      
      const response = await fetch(test.url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        successCount++;
        
        console.log(`   ✅ Status: ${response.status} OK`);
        
        if (Array.isArray(data)) {
          console.log(`   📦 Records Found: ${data.length}`);
          
          if (data.length > 0) {
            const firstRecord = data[0];
            const keys = Object.keys(firstRecord).slice(0, 4);
            console.log(`   🔑 Fields: ${keys.join(', ')}`);
            console.log(`   📋 Sample: ${JSON.stringify(firstRecord).substring(0, 80)}...`);
          }
        } else if (typeof data === 'object') {
          const keys = Object.keys(data).slice(0, 3);
          console.log(`   📋 Response: ${keys.join(', ')}`);
        }
      } else {
        failureCount++;
        console.log(`   ❌ Status: ${response.status} ${response.statusText}`);
        const error = await response.text();
        console.log(`   📝 Error: ${error.substring(0, 100)}`);
      }
      console.log();
      
    } catch (error) {
      failureCount++;
      console.log(`   ❌ Connection Error: ${error.message}\n`);
    }
  }

  // Summary
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  📊 TEST SUMMARY                                           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`✅ Successful: ${successCount}/${tests.length}`);
  console.log(`❌ Failed: ${failureCount}/${tests.length}\n`);

  if (successCount === tests.length) {
    console.log('🎉 ALL TESTS PASSED! Backend is working correctly.\n');
    console.log('✨ FRONTEND CAN FETCH DATA FROM BACKEND\n');
    console.log('API Endpoints Ready:');
    console.log('  • http://localhost:5000/api/health');
    console.log('  • http://localhost:5000/api/members');
    console.log('  • http://localhost:5000/api/attendance');
    console.log('  • http://localhost:5000/api/seva\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
}

// Wait for server to start
console.log('⏳ Waiting for backend server to be ready...\n');
setTimeout(testDataFlow, 3000);
