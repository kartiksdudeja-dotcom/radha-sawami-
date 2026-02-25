$uri = 'http://localhost:5000/api/seva/report?fromDate=2025-12-01&toDate=2025-12-29'
Write-Host 'Testing Seva Report API...' -ForegroundColor Cyan
try {
  $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 10
  $data = $response.Content | ConvertFrom-Json
  Write-Host "✅ Success! Found $($data.data.Count) records" -ForegroundColor Green
  Write-Host ""
  
  if ($data.data.Count -gt 0) {
    Write-Host "Sample records (first 5):" -ForegroundColor Yellow
    Write-Host "Sr.No | Member Name | Status | DOB | Gender | Association | Date | Hours | Amount`n"
    
    $data.data | Select-Object -First 5 | ForEach-Object {
      $output = "$($_.id) | $($_.memberName) | $($_.status) | $($_.dateOfBirth) | $($_.gender) | $($_.association) | $($_.date) | $($_.hours) | ₹$($_.amount)"
      Write-Host $output
    }
  }
} catch {
  Write-Host "❌ Error: $_" -ForegroundColor Red
}
