import http from 'http';
import fs from 'fs';

const url = 'http://localhost:5000/api/seva/report?fromDate=2024-01-01&toDate=2026-12-31';

http.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      const logFile = 'api_results.txt';
      fs.writeFileSync(logFile, JSON.stringify(json, null, 2));
      console.log(`Results saved to ${logFile}`);
      const withCategory = json.data.filter(r => r.category || r.categoryName || r.seva_name || r.SevaName);
      console.log('Records with some category/seva info count:', withCategory.length);
      if (withCategory.length > 0) {
        console.log('Sample record with info:', JSON.stringify(withCategory[0], null, 2));
      }
    } catch (e) {
      console.error('Parse Error:', e.message);
      console.log('Raw data sample:', data.substring(0, 100));
    }
  });
}).on('error', (err) => {
  console.error('Fetch Error:', err.message);
});
