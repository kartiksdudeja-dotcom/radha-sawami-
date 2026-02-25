import { getPool } from './config/db.js';
import sql from 'mssql';

async function migrateNotificationsTable() {
  try {
    const pool = await getPool();
    
    console.log('🔄 Migrating notifications table to allow NULL uid...');
    
    // Check if table exists
    const tableCheck = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'notifications'
    `);
    
    if (tableCheck.recordset.length === 0) {
      console.log('⚠️ notifications table does not exist, creating...');
      
      await pool.request().query(`
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
      `);
      console.log('✅ Notifications table created with nullable uid!');
    } else {
      console.log('✅ Notifications table exists, altering uid column...');
      
      // Try to alter the column
      try {
        await pool.request().query(`
          ALTER TABLE notifications 
          ALTER COLUMN uid NVARCHAR(50) NULL;
        `);
        console.log('✅ uid column is now nullable!');
      } catch (error) {
        if (error.message.includes('already allows')) {
          console.log('✅ uid column already allows NULL');
        } else {
          console.warn('⚠️ Could not alter column:', error.message);
          console.log('   Attempting to recreate table...');
          
          // Backup and recreate
          await pool.request().query(`
            DROP TABLE IF EXISTS notifications;
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
          `);
          console.log('✅ Notifications table recreated with nullable uid!');
        }
      }
    }
    
    console.log('✅ Migration complete! Ready for send-to-all notifications.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrateNotificationsTable();
