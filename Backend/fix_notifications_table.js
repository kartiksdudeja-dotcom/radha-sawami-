import { getPool } from './config/db.js';
import sql from 'mssql';

async function fixNotificationsTable() {
  try {
    const pool = await getPool();
    
    console.log('🔄 Checking notifications table...');
    
    // Check if uid column is nullable
    const checkResult = await pool.request().query(`
      SELECT COLUMN_NAME, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'notifications' AND COLUMN_NAME = 'uid'
    `);
    
    if (checkResult.recordset.length > 0) {
      const isNullable = checkResult.recordset[0].IS_NULLABLE === 'YES';
      
      if (!isNullable) {
        console.log('⚠️ uid column is NOT nullable, fixing...');
        
        // Drop the constraint if it exists
        await pool.request().query(`
          ALTER TABLE notifications 
          ALTER COLUMN uid NVARCHAR(50) NULL;
        `);
        
        console.log('✅ uid column is now nullable');
      } else {
        console.log('✅ uid column already allows NULL');
      }
    } else {
      console.log('⚠️ notifications table not found, creating...');
      
      // Create the table
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'notifications')
        BEGIN
          CREATE TABLE notifications (
            id INT PRIMARY KEY IDENTITY(1,1),
            uid NVARCHAR(50) NULL,
            title NVARCHAR(200) NOT NULL,
            message NVARCHAR(MAX) NOT NULL,
            type NVARCHAR(50) DEFAULT 'general',
            [read] BIT DEFAULT 0,
            send_to_all BIT DEFAULT 0,
            created_at DATETIME DEFAULT GETDATE(),
            updated_at DATETIME DEFAULT GETDATE(),
            created_by NVARCHAR(50),
            INDEX idx_uid (uid),
            INDEX idx_send_to_all (send_to_all),
            INDEX idx_created_at (created_at)
          );
          PRINT '✅ Notifications table created with nullable uid!';
        END
      `);
    }
    
    console.log('✅ Database fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing notifications table:', error.message);
    process.exit(1);
  }
}

// Run fix
fixNotificationsTable();
