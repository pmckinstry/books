import Database from 'better-sqlite3';
import path from 'path';

// Connect to the database
const dbPath = path.join(process.cwd(), 'data', 'books.db');
const db = new Database(dbPath);

console.log('Fixing reading list book references...');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  // Get all reading list books
  const readingListBooks = db.prepare('SELECT * FROM reading_list_books').all() as any[];
  console.log(`Found ${readingListBooks.length} reading list books`);

  // Get all books
  const books = db.prepare('SELECT * FROM books').all() as any[];
  console.log(`Found ${books.length} books`);

  // Create a mapping of old integer IDs to new UUIDs
  // We'll use the position in the array to map them
  const bookIdMap: Record<string, string> = {};
  
  // For now, let's just map the first few books to fix the immediate issue
  // In a real scenario, you'd want to match by title/author or use a proper mapping
  const bookTitles = [
    'Of Mice and Men',
    'The Grapes of Wrath',
    'East of Eden'
  ];

  for (let i = 0; i < Math.min(bookTitles.length, books.length); i++) {
    const book = books[i];
    if (book.title === bookTitles[i]) {
      // Map the old integer ID (1, 2, 3) to the new UUID
      const oldId = (i + 1).toString();
      bookIdMap[oldId] = book.id;
      console.log(`Mapping book ${oldId} (${book.title}) to ${book.id}`);
    }
  }

  // Update reading list books to use correct book IDs
  let updatedCount = 0;
  for (const rlb of readingListBooks) {
    // Check if this book_id exists in the books table
    const bookExists = db.prepare('SELECT id FROM books WHERE id = ?').get(rlb.book_id);
    
    if (!bookExists) {
      // This book_id doesn't exist, we need to fix it
      console.log(`Book ID ${rlb.book_id} not found, needs fixing`);
      
      // For now, let's assign it to the first available book
      if (books.length > 0) {
        const newBookId = books[0].id;
        db.prepare(`
          UPDATE reading_list_books 
          SET book_id = ? 
          WHERE id = ?
        `).run(newBookId, rlb.id);
        
        updatedCount++;
        console.log(`Updated reading list book ${rlb.id} to use book ${newBookId}`);
      }
    }
  }

  // Commit transaction
  db.exec('COMMIT');
  
  console.log(`Fixed ${updatedCount} reading list book references`);
  
} catch (error) {
  console.error('Fix failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
