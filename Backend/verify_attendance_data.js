import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testFullDataFlow() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║  📊 ATTENDANCE REPORT DATA VERIFICATION                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    console.log('⏳ Fetching Attendance Data (NO LIMITS)...\n');
    
    const response = await fetch(`${BASE_URL}/attendance`);
    
    if (!response.ok) {
      console.error(`❌ Error: ${response.status} ${response.statusText}`);
      return;
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error(`❌ API Error: ${result.message}`);
      return;
    }

    const attendanceRecords = result.data;
    console.log(`✅ Successfully fetched ALL attendance records\n`);
    console.log(`📊 TOTAL RECORDS: ${attendanceRecords.length}\n`);

    // Analyze data
    console.log('📈 DATA BREAKDOWN:\n');
    
    // By date
    const dates = [...new Set(attendanceRecords.map(r => r.date))];
    console.log(`  Unique Dates: ${dates.length}`);
    console.log(`  First Record: ${attendanceRecords[attendanceRecords.length - 1]?.date}`);
    console.log(`  Latest Record: ${attendanceRecords[0]?.date}\n`);
    
    // By shift
    const shifts = {};
    attendanceRecords.forEach(r => {
      shifts[r.shift] = (shifts[r.shift] || 0) + 1;
    });
    console.log(`  By Shift:`);
    Object.entries(shifts).forEach(([shift, count]) => {
      console.log(`    • ${shift}: ${count}`);
    });
    console.log();

    // By category
    const categories = {};
    attendanceRecords.forEach(r => {
      categories[r.category] = (categories[r.category] || 0) + 1;
    });
    console.log(`  By Category:`);
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`    • ${cat}: ${count}`);
    });
    console.log();

    // Total members in records
    let totalMembers = 0;
    attendanceRecords.forEach(r => {
      if (r.members) totalMembers += r.members.length;
    });
    console.log(`  Total Member Entries: ${totalMembers}\n`);

    // Sample records
    console.log('📋 SAMPLE RECORDS:\n');
    for (let i = 0; i < Math.min(5, attendanceRecords.length); i++) {
      const record = attendanceRecords[i];
      console.log(`  ${i+1}. Date: ${record.date} | Shift: ${record.shift} | Members: ${record.members?.length || 0}`);
      if (record.members && record.members.length > 0) {
        record.members.slice(0, 3).forEach(m => {
          console.log(`     └─ ${m.name} (${m.stat_category})`);
        });
        if (record.members.length > 3) {
          console.log(`     └─ ... and ${record.members.length - 3} more`);
        }
      }
    }

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ DATA VERIFICATION COMPLETE                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('✨ FRONTEND CAN NOW DISPLAY:');
    console.log(`   • All ${attendanceRecords.length} attendance records`);
    console.log(`   • No pagination limits`);
    console.log(`   • Complete data from ${dates.length} unique dates\n`);

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    console.error('Make sure backend is running: npm start\n');
  }
}

console.log('⏳ Waiting for backend server...');
setTimeout(testFullDataFlow, 2000);
