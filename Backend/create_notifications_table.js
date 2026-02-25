import { getPool } from './config/db.js';
import sql from 'mssql';

async function createNotificationsTable() {
  try {
    const pool = await getPool();
    
    console.log('🔄 Setting up notifications table...');
    
    // Drop existing table and recreate with nullable uid
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
      PRINT '✅ Notifications table created successfully!';
    `);

    console.log('✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error creating notifications table:', error.message);
    process.exit(1);
  }
}

// Run setup
createNotificationsTable();
