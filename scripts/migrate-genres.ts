import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'books.db');
const db = new Database(dbPath);

// 1. Create genres and book_genres tables
console.log('Creating genres and book_genres tables...');
db.exec(`
  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS book_genres (
    book_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    PRIMARY KEY (book_id, genre_id),
    FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
  );
`);

// 2. Insert genres
const genres = [
  'Classic', 'Dystopian', 'Romance', 'Fantasy', 'Adventure', 'Horror', 'Science Fiction', 'Satire', 'Historical', 'Philosophy', 'Children', 'Poetry', 'Drama', 'Mystery', 'Nonfiction'
];
const genreMap: Record<string, number> = {};
const insertGenre = db.prepare('INSERT OR IGNORE INTO genres (name) VALUES (?)');
const selectGenre = db.prepare('SELECT id FROM genres WHERE name = ?');
for (const g of genres) {
  insertGenre.run(g);
  const row = selectGenre.get(g) as { id: number } | undefined;
  if (row) {
    genreMap[g] = row.id;
  }
}

// 3. Assign specific genres to known books
const bookGenres: Record<string, string> = {
  'The Great Gatsby': 'Classic',
  'To Kill a Mockingbird': 'Classic',
  '1984': 'Dystopian',
  'Pride and Prejudice': 'Romance',
  'The Catcher in the Rye': 'Classic',
  'Lord of the Flies': 'Classic',
  'Animal Farm': 'Satire',
  'The Hobbit': 'Fantasy',
  'The Lord of the Rings': 'Fantasy',
  'Jane Eyre': 'Romance',
  'Wuthering Heights': 'Romance',
  'Moby-Dick': 'Adventure',
  'The Adventures of Huckleberry Finn': 'Adventure',
  'The Adventures of Tom Sawyer': 'Adventure',
  'Little Women': 'Classic',
  'The Scarlet Letter': 'Classic',
  'The Picture of Dorian Gray': 'Classic',
  'Dracula': 'Horror',
  'Frankenstein': 'Horror',
  "Alice's Adventures in Wonderland": 'Children',
  // Add more mappings as needed
};

const selectBook = db.prepare('SELECT id FROM books WHERE title = ?');
const insertBookGenre = db.prepare('INSERT OR IGNORE INTO book_genres (book_id, genre_id) VALUES (?, ?)');

// 4. Assign specific genres to mapped books
for (const [title, genre] of Object.entries(bookGenres)) {
  const book = selectBook.get(title) as { id: number } | undefined;
  if (book && genreMap[genre]) {
    insertBookGenre.run(book.id, genreMap[genre]);
    console.log(`Assigned genre '${genre}' to book '${title}'`);
  }
}

// 5. Assign default genre (Classic) to all remaining books
const selectAllBooks = db.prepare('SELECT id, title FROM books');
const selectBookGenre = db.prepare('SELECT COUNT(*) as count FROM book_genres WHERE book_id = ?');
const allBooks = selectAllBooks.all() as { id: number; title: string }[];

for (const book of allBooks) {
  const genreCount = selectBookGenre.get(book.id) as { count: number };
  if (genreCount.count === 0 && genreMap['Classic']) {
    insertBookGenre.run(book.id, genreMap['Classic']);
    console.log(`Assigned default genre 'Classic' to book '${book.title}'`);
  }
}

console.log('Migration complete!'); 