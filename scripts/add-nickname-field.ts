import Database from 'better-sqlite3';
import path from 'path';

function addNicknameField() {
  const dbPath = path.join(process.cwd(), 'data', 'books.db');
  const db = new Database(dbPath);

  try {
    // Add nickname column to users table
    db.exec('ALTER TABLE users ADD COLUMN nickname TEXT');
    
    // Update existing users to have their username as their nickname
    db.exec('UPDATE users SET nickname = username WHERE nickname IS NULL');
    
    console.log('Successfully added nickname field to users table');
    console.log('Updated existing users with username as nickname');
    
    // Show the updated table structure
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    console.log('\nUpdated users table structure:');
    tableInfo.forEach((column: any) => {
      console.log(`- ${column.name} (${column.type})`);
    });
    
  } catch (error) {
    console.error('Error adding nickname field:', error);
  } finally {
    db.close();
  }
}

addNicknameField(); 