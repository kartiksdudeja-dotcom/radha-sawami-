-- Check Attendance table schema
SELECT 
  COLUMN_NAME,
  DATA_TYPE,
  IS_NULLABLE,
  COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Attendance'
ORDER BY ORDINAL_POSITION;

-- Check recent attendance data
SELECT TOP 10
  Attendance_Id,
  UserID,
  Attendance_date,
  Shift,
  Audio_Satsang,
  PresentTime,
  dt,
  day,
  month,
  year
FROM Attendance
ORDER BY Attendance_Id DESC;

-- Count NULL values
SELECT
  SUM(CASE WHEN dt IS NULL THEN 1 ELSE 0 END) as null_dt,
  SUM(CASE WHEN day IS NULL THEN 1 ELSE 0 END) as null_day,
  SUM(CASE WHEN month IS NULL THEN 1 ELSE 0 END) as null_month,
  SUM(CASE WHEN year IS NULL THEN 1 ELSE 0 END) as null_year,
  COUNT(*) as total_records
FROM Attendance;
