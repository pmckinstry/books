import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Connect to the database
const dbPath = path.join(process.cwd(), 'data', 'books.db');
const db = new Database(dbPath);

console.log('Starting migration of books to UUID...');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  // Create new books table with UUID primary key
  console.log('Creating new books table with UUID...');
  db.exec(`
    CREATE TABLE books_new (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      description TEXT,
      isbn TEXT,
      page_count INTEGER,
      language TEXT,
      publisher TEXT,
      cover_image_url TEXT,
      publication_date TEXT,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create new genres table with UUID primary key
  console.log('Creating new genres table with UUID...');
  db.exec(`
    CREATE TABLE genres_new (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create new book_genres table with UUID foreign keys
  console.log('Creating new book_genres table with UUID...');
  db.exec(`
    CREATE TABLE book_genres_new (
      book_id TEXT NOT NULL,
      genre_id TEXT NOT NULL,
      PRIMARY KEY (book_id, genre_id),
      FOREIGN KEY (book_id) REFERENCES books_new (id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres_new (id) ON DELETE CASCADE
    )
  `);

  // Migrate genres data
  console.log('Migrating genres data...');
  const genres = db.prepare('SELECT * FROM genres').all() as any[];
  const genreMap: Record<number, string> = {};
  
  for (const genre of genres) {
    const newId = uuidv4();
    genreMap[genre.id] = newId;
    
    db.prepare(`
      INSERT INTO genres_new (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(newId, genre.name, genre.description, genre.created_at, genre.updated_at);
  }

  // Migrate books data
  console.log('Migrating books data...');
  const books = db.prepare('SELECT * FROM books').all() as any[];
  const bookMap: Record<number, string> = {};
  
  for (const book of books) {
    const newId = uuidv4();
    bookMap[book.id] = newId;
    
    db.prepare(`
      INSERT INTO books_new (id, title, author, year, description, isbn, page_count, language, publisher, cover_image_url, publication_date, user_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(newId, book.title, book.author, book.year, book.description, book.isbn, book.page_count, book.language, book.publisher, book.cover_image_url, book.publication_date, book.user_id, book.created_at, book.updated_at);
  }

  // Migrate book_genres data
  console.log('Migrating book_genres data...');
  const bookGenres = db.prepare('SELECT * FROM book_genres').all() as any[];
  
  for (const bg of bookGenres) {
    const newBookId = bookMap[bg.book_id];
    const newGenreId = genreMap[bg.genre_id];
    
    if (newBookId && newGenreId) {
      db.prepare(`
        INSERT INTO book_genres_new (book_id, genre_id)
        VALUES (?, ?)
      `).run(newBookId, newGenreId);
    }
  }

  // Update reading_list_books with new book IDs
  console.log('Updating reading_list_books with new book IDs...');
  const readingListBooks = db.prepare('SELECT * FROM reading_list_books').all() as any[];
  
  for (const rlb of readingListBooks) {
    const newBookId = bookMap[parseInt(rlb.book_id)];
    if (newBookId) {
      db.prepare(`
        UPDATE reading_list_books 
        SET book_id = ? 
        WHERE id = ?
      `).run(newBookId, rlb.id);
    }
  }

  // Drop old tables
  console.log('Dropping old tables...');
  db.exec('DROP TABLE book_genres');
  db.exec('DROP TABLE genres');
  db.exec('DROP TABLE books');

  // Rename new tables
  console.log('Renaming new tables...');
  db.exec('ALTER TABLE books_new RENAME TO books');
  db.exec('ALTER TABLE genres_new RENAME TO genres');
  db.exec('ALTER TABLE book_genres_new RENAME TO book_genres');

  // Create indexes
  console.log('Creating indexes...');
  db.exec('CREATE INDEX idx_books_title ON books(title)');
  db.exec('CREATE INDEX idx_books_author ON books(author)');
  db.exec('CREATE INDEX idx_genres_name ON genres(name)');

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Migration completed successfully!');
  console.log(`Migrated ${genres.length} genres, ${books.length} books, and ${bookGenres.length} book-genre associations`);
  
} catch (error) {
  console.error('Migration failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
