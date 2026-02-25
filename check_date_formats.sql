-- Check what date formats actually exist in Attendance_date column
SELECT TOP 20 
  Attendance_Id,
  Attendance_date,
  LEN(Attendance_date) as Length,
  CHARINDEX('/', Attendance_date) as FirstSlash
FROM Attendance
ORDER BY Attendance_Id DESC;

-- Check for non-standard date formats
SELECT DISTINCT 
  Attendance_date,
  LEN(Attendance_date) as Length
FROM Attendance
WHERE Attendance_date NOT LIKE '[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9]'
  AND Attendance_date NOT LIKE '[0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9]'
  AND Attendance_date NOT LIKE '[0-9][0-9]/[0-9]/[0-9][0-9][0-9][0-9]'
LIMIT 10;

-- Count by format
SELECT 
  LEN(Attendance_date) as DateLength,
  COUNT(*) as Count
FROM Attendance
GROUP BY LEN(Attendance_date)
ORDER BY DateLength;
