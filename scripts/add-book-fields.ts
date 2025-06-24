import Database from 'better-sqlite3';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'books.db');
const db = new Database(dbPath);

console.log('Starting migration: Adding new book fields...');

try {
  // Add new columns to the books table
  db.exec(`
    ALTER TABLE books ADD COLUMN isbn TEXT;
  `);
  console.log('✓ Added ISBN column');

  db.exec(`
    ALTER TABLE books ADD COLUMN page_count INTEGER;
  `);
  console.log('✓ Added page_count column');

  db.exec(`
    ALTER TABLE books ADD COLUMN language TEXT DEFAULT 'English';
  `);
  console.log('✓ Added language column');

  db.exec(`
    ALTER TABLE books ADD COLUMN publisher TEXT;
  `);
  console.log('✓ Added publisher column');

  db.exec(`
    ALTER TABLE books ADD COLUMN cover_image_url TEXT;
  `);
  console.log('✓ Added cover_image_url column');

  db.exec(`
    ALTER TABLE books ADD COLUMN publication_date DATE;
  `);
  console.log('✓ Added publication_date column');

  // Create index for ISBN for faster lookups
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
  `);
  console.log('✓ Created ISBN index');

  // Create index for language for filtering
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_books_language ON books(language);
  `);
  console.log('✓ Created language index');

  // Create index for publisher for filtering
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_books_publisher ON books(publisher);
  `);
  console.log('✓ Created publisher index');

  // Update some sample books with the new fields
  const updateBook = db.prepare(`
    UPDATE books SET 
      isbn = ?, 
      page_count = ?, 
      language = ?, 
      publisher = ?, 
      cover_image_url = ?, 
      publication_date = ?
    WHERE title = ?
  `);

  // Sample data updates for some classic books
  const bookUpdates = [
    ['978-0743273565', 180, 'English', 'Scribner', 'https://example.com/gatsby.jpg', '1925-04-10', 'The Great Gatsby'],
    ['978-0446310789', 376, 'English', 'Grand Central Publishing', 'https://example.com/mockingbird.jpg', '1960-07-11', 'To Kill a Mockingbird'],
    ['978-0451524935', 328, 'English', 'Signet', 'https://example.com/1984.jpg', '1949-06-08', '1984'],
    ['978-0141439518', 432, 'English', 'Penguin Classics', 'https://example.com/pride.jpg', '1813-01-28', 'Pride and Prejudice'],
    ['978-0316769488', 224, 'English', 'Little, Brown and Company', 'https://example.com/catcher.jpg', '1951-07-16', 'The Catcher in the Rye'],
    ['978-0399501487', 224, 'English', 'Penguin Books', 'https://example.com/flies.jpg', '1954-09-17', 'Lord of the Flies'],
    ['978-0451526342', 112, 'English', 'Signet', 'https://example.com/animal-farm.jpg', '1945-08-17', 'Animal Farm'],
    ['978-0547928247', 366, 'English', 'Houghton Mifflin Harcourt', 'https://example.com/hobbit.jpg', '1937-09-21', 'The Hobbit'],
    ['978-0547928210', 1216, 'English', 'Houghton Mifflin Harcourt', 'https://example.com/lotr.jpg', '1954-07-29', 'The Lord of the Rings'],
    ['978-0141441146', 624, 'English', 'Penguin Classics', 'https://example.com/jane-eyre.jpg', '1847-10-16', 'Jane Eyre'],
  ];

  bookUpdates.forEach(([isbn, pageCount, language, publisher, coverUrl, pubDate, title]) => {
    updateBook.run(isbn, pageCount, language, publisher, coverUrl, pubDate, title);
  });

  console.log('✓ Updated sample books with new field data');

  console.log('\nMigration completed successfully!');
  console.log('New fields added: ISBN, page_count, language, publisher, cover_image_url, publication_date');

} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
} 