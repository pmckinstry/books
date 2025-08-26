import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Connect to the database
const dbPath = path.join(process.cwd(), 'data', 'books.db');
const db = new Database(dbPath);

console.log('Starting migration of reading lists to UUID...');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  // Create new tables with UUID primary keys
  console.log('Creating new reading_lists table with UUID...');
  db.exec(`
    CREATE TABLE reading_lists_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT 0,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('Creating new reading_list_books table with UUID...');
  db.exec(`
    CREATE TABLE reading_list_books_new (
      id TEXT PRIMARY KEY,
      reading_list_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      notes TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migrate reading lists data
  console.log('Migrating reading lists data...');
  const readingLists = db.prepare('SELECT * FROM reading_lists').all() as any[];
  
  for (const readingList of readingLists) {
    const newId = uuidv4();
    const newUserId = readingList.user_id === 1 ? 'admin-user-id' : uuidv4(); // Assuming admin user
    
    db.prepare(`
      INSERT INTO reading_lists_new (id, name, description, is_public, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, readingList.name, readingList.description, readingList.is_public, newUserId, readingList.created_at, readingList.updated_at);
    
    // Store mapping for foreign key updates
    readingList.newId = newId;
  }

  // Migrate reading list books data
  console.log('Migrating reading list books data...');
  const readingListBooks = db.prepare('SELECT * FROM reading_list_books').all() as any[];
  
  for (const rlb of readingListBooks) {
    // Find the new reading list ID
    const readingList = readingLists.find(rl => rl.id === rlb.reading_list_id);
    if (!readingList) {
      console.warn(`Could not find reading list ${rlb.reading_list_id} for book ${rlb.book_id}`);
      continue;
    }
    
    const newId = uuidv4();
    db.prepare(`
      INSERT INTO reading_list_books_new (id, reading_list_id, book_id, position, notes, added_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(newId, readingList.newId, rlb.book_id, rlb.position, rlb.notes, rlb.added_at);
  }

  // Drop old tables
  console.log('Dropping old tables...');
  db.exec('DROP TABLE reading_list_books');
  db.exec('DROP TABLE reading_lists');

  // Rename new tables
  console.log('Renaming new tables...');
  db.exec('ALTER TABLE reading_lists_new RENAME TO reading_lists');
  db.exec('ALTER TABLE reading_list_books_new RENAME TO reading_list_books');

  // Create indexes
  console.log('Creating indexes...');
  db.exec('CREATE INDEX idx_reading_lists_user_id ON reading_lists(user_id)');
  db.exec('CREATE INDEX idx_reading_list_books_reading_list_id ON reading_list_books(reading_list_id)');
  db.exec('CREATE INDEX idx_reading_list_books_book_id ON reading_list_books(book_id)');

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Migration completed successfully!');
  console.log(`Migrated ${readingLists.length} reading lists and ${readingListBooks.length} reading list books`);
  
} catch (error) {
  console.error('Migration failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
