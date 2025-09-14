import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'books.db');
const db = new Database(dbPath);

// Initialize the database with the books table
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT,
      isbn TEXT,
      page_count INTEGER,
      language TEXT DEFAULT 'English',
      publisher TEXT,
      cover_image_url TEXT,
      publication_date DATE,
      user_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_book_associations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      read_status TEXT DEFAULT 'unread' CHECK (read_status IN ('unread', 'reading', 'read')),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
      UNIQUE(user_id, book_id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS genres (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS book_genres (
      book_id TEXT NOT NULL,
      genre_id TEXT NOT NULL,
      PRIMARY KEY (book_id, genre_id),
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reading_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_public BOOLEAN DEFAULT 0,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS reading_list_books (
      id TEXT PRIMARY KEY,
      reading_list_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      notes TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(reading_list_id, book_id)
    )
  `);

  // Insert sample data if the table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };
  if (count.count === 0) {
    // Define genres with descriptions
    const genres = [
      { name: 'Classic', description: 'Timeless literary works that have stood the test of time and continue to be widely read and studied.' },
      { name: 'Dystopian', description: 'Fiction set in a society characterized by oppression, totalitarianism, or other negative social conditions.' },
      { name: 'Romance', description: 'Stories focused on romantic relationships and emotional connections between characters.' },
      { name: 'Fantasy', description: 'Fiction featuring magical elements, supernatural creatures, and imaginary worlds.' },
      { name: 'Adventure', description: 'Stories involving exciting journeys, quests, and thrilling experiences.' },
      { name: 'Horror', description: 'Fiction designed to frighten, scare, or startle readers through supernatural or psychological elements.' },
      { name: 'Science Fiction', description: 'Fiction that explores futuristic concepts, advanced technology, and scientific possibilities.' },
      { name: 'Satire', description: 'Works that use humor, irony, or exaggeration to criticize or expose flaws in society.' },
      { name: 'Historical', description: 'Fiction set in the past, often incorporating real historical events and figures.' },
      { name: 'Philosophy', description: 'Works that explore fundamental questions about existence, knowledge, values, and reality.' },
      { name: 'Children', description: 'Literature written specifically for young readers, often featuring educational or moral themes.' },
      { name: 'Poetry', description: 'Literary works that use rhythm, meter, and figurative language to express ideas and emotions.' },
      { name: 'Drama', description: 'Works written for performance, typically featuring dialogue and stage directions.' },
      { name: 'Mystery', description: 'Stories involving puzzles, crimes, or unexplained events that require investigation.' },
      { name: 'Nonfiction', description: 'Works based on factual information and real events, including biographies, history, and essays.' },
      { name: 'Biography', description: 'A detailed description of a person\'s life, experiences, and achievements.' },
      { name: 'Autobiography', description: 'A self-written account of the life of the author.' },
      { name: 'Memoir', description: 'A collection of memories and personal experiences written by the author.' },
      { name: 'Self-Help', description: 'Books designed to guide readers in solving personal problems and improving their lives.' },
      { name: 'Health', description: 'Books focused on physical and mental health, wellness, and medical topics.' },
      { name: 'Travel', description: 'Books that describe journeys to different places, cultures, and experiences.' },
      { name: 'Cooking', description: 'Books of recipes and culinary techniques, including cooking guides and food culture.' },
      { name: 'Art', description: 'Books focused on visual arts, including painting, sculpture, and photography.' },
      { name: 'Music', description: 'Books focused on music, musicians, and musical history and theory.' },
      { name: 'Business', description: 'Books about business strategies, entrepreneurship, leadership, and economics.' },
      { name: 'Technology', description: 'Books about technological innovations, software, hardware, and their societal impacts.' },
      { name: 'Education', description: 'Books focused on teaching methods, learning processes, and educational systems.' },
      { name: 'Spirituality', description: 'Books that explore spiritual beliefs, practices, and philosophies.' },
      { name: 'Religion', description: 'Books that discuss religious beliefs, practices, history, and theology.' },
      { name: 'Politics', description: 'Books about government systems, political theories, and political history.' },
      { name: 'Science', description: 'Books that cover scientific topics and discoveries in various fields.' },
      { name: 'Nature', description: 'Books that explore the natural world, wildlife, and environmental issues.' },
      { name: 'Sports', description: 'Books about athletic activities, athletes, and the culture of sports.' },
      { name: 'Humor', description: 'Books intended to amuse or entertain, often through wit and satire.' },
      { name: 'Fantasy', description: 'Fiction featuring magical elements, supernatural creatures, and imaginary worlds.' },
      { name: 'Thriller', description: 'Books characterized by excitement, suspense, and high stakes.' },
      { name: 'Crime', description: 'Books focused on criminal activity, law enforcement, and investigations.' },
      { name: 'Young Adult', description: 'Books aimed at teenage readers, exploring coming-of-age themes.' },
    ];

    const insertGenre = db.prepare(
      'INSERT OR IGNORE INTO genres (id, name, description) VALUES (?, ?, ?)'
    );
    for (const genre of genres) {
      insertGenre.run(uuidv4(), genre.name, genre.description);
    }

    const books = [
      ['One Hundred Years of Solitude', 'Gabriel García Márquez', 'A novel about the Buendía family over seven generations.', '978-0060883287', 417, 'English', 'Harper Perennial', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/320.jpg', '1967-06-05', 'Fantasy'],
      ['Love in the Time of Cholera', 'Gabriel García Márquez', 'A novel about a love triangle spanning fifty years.', '978-0307387262', 368, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9712.jpg', '1985-01-01', 'Romance'],
      ['The House of the Spirits', 'Isabel Allende', 'A novel about the Trueba family over four generations in Chile.', '978-0553383805', 432, 'English', 'Bantam', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9326.jpg', '1982-01-01', 'Fantasy'],
      ['Pedro Páramo', 'Juan Rulfo', 'A novel about a man who visits his father\'s hometown and finds it inhabited by ghosts.', '978-0802133908', 124, 'English', 'Grove Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9327.jpg', '1955-01-01', 'Fantasy'],
      ['The Aleph', 'Jorge Luis Borges', 'A collection of short stories exploring themes of infinity and reality.', '978-0142437889', 208, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9328.jpg', '1949-01-01', 'Fantasy'],
      ['Ficciones', 'Jorge Luis Borges', 'A collection of short stories that blend fantasy and reality.', '978-0802130303', 174, 'English', 'Grove Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9329.jpg', '1944-01-01', 'Fantasy'],
      ['The Labyrinth of Solitude', 'Octavio Paz', 'An essay about Mexican identity and culture.', '978-0802133885', 212, 'English', 'Grove Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9330.jpg', '1950-01-01', 'Nonfiction'],
      ['The Death of Artemio Cruz', 'Carlos Fuentes', 'A novel about a dying man reflecting on his life during the Mexican Revolution.', '978-0374530817', 320, 'English', 'Farrar, Straus and Giroux', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9331.jpg', '1962-01-01', 'Historical'],
      ['Hopscotch', 'Julio Cortázar', 'A novel that can be read in multiple orders, exploring themes of chance and choice.', '978-0811218479', 576, 'English', 'New Directions', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9332.jpg', '1963-01-01', 'Classic'],
      ['The Tunnel', 'Ernesto Sabato', 'A novel about an artist who becomes obsessed with a woman he sees at an exhibition.', '978-0141180144', 160, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9333.jpg', '1948-01-01', 'Classic'],
      ['The Plague', 'Albert Camus', 'A novel about a plague that strikes the Algerian city of Oran.', '978-0679720218', 308, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11989.jpg', '1947-01-01', 'Classic'],
      ['The Stranger', 'Albert Camus', 'A novel about a man who kills an Arab and faces the absurdity of life.', '978-0679720201', 123, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1590930002i/49552.jpg', '1942-01-01', 'Classic'],
      ['The Myth of Sisyphus', 'Albert Camus', 'An essay about the absurd and the meaning of life.', '978-0679720201', 212, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11990.jpg', '1942-01-01', 'Philosophy'],
      ['The Fall', 'Albert Camus', 'A novel about a lawyer who confesses his guilt to a stranger.', '978-0679720225', 147, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11991.jpg', '1956-01-01', 'Classic'],
      ['Nausea', 'Jean-Paul Sartre', 'A novel about a man who experiences existential nausea and alienation.', '978-0811201884', 178, 'English', 'New Directions', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11992.jpg', '1938-01-01', 'Classic'],
      ['Being and Nothingness', 'Jean-Paul Sartre', 'A philosophical work about existentialism and consciousness.', '978-0671867805', 688, 'English', 'Washington Square Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11993.jpg', '1943-01-01', 'Philosophy'],
      ['The Little Prince', 'Antoine de Saint-Exupéry', 'A children\'s book about a young prince who visits various planets.', '978-0156013987', 96, 'English', 'Harcourt', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/157993.jpg', '1943-04-06', 'Children'],
    ];

    const insertBook = db.prepare(`
      INSERT INTO books (id, title, author, description, isbn, page_count, language, publisher, cover_image_url, publication_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertBookGenre = db.prepare(`
      INSERT INTO book_genres (book_id, genre_id)
      VALUES (?, (SELECT id FROM genres WHERE name = ?))
    `);

    for (const book of books) {
      const [title, author, description, isbn, page_count, language, publisher, cover_image_url, publication_date, genre] = book;
      const id = uuidv4();
      insertBook.run(id, title, author, description, isbn, page_count, language, publisher, cover_image_url, publication_date);
      insertBookGenre.run(id, genre);
    }
  }
}

initializeDatabase();

// SQLite implementations of the operations
export const userOperations = {
  getById: (id: number) => db.prepare('SELECT * FROM users WHERE id = ?').get(id),
  create: async ({ username, password, nickname }: { username: string; password: string; nickname?: string }) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (id, username, password, nickname) VALUES (?, ?, ?, ?)');
    const id = uuidv4();
    stmt.run(id, username, hashedPassword, nickname || null);
    return { id, username, nickname: nickname || null };
  },
  authenticate: async ({ username, password }: { username: string; password: string }) => {
    type DbUser = { id: string; username: string; password: string; nickname: string | null } | undefined;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as unknown as DbUser;
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    return valid ? { id: user.id, username: user.username, nickname: user.nickname } : null;
  },
  usernameExists: (username: string) => {
    const result = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username);
    return !!result;
  },
  updateProfile: (id: number, data: { nickname?: string }) => {
    const stmt = db.prepare('UPDATE users SET nickname = ? WHERE id = ?');
    stmt.run(data.nickname || null, id);
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },
};

export const bookOperations = {
  getAll: () => db.prepare('SELECT * FROM books').all(),
  getById: (id: number) => db.prepare('SELECT * FROM books WHERE id = ?').get(id),
  create: ({ title, author, description }: { title: string; author: string; description?: string }) => {
    const stmt = db.prepare('INSERT INTO books (id, title, author, description) VALUES (?, ?, ?, ?)');
    const id = uuidv4();
    stmt.run(id, title, author, description || null);
    return { id, title, author, description: description || null };
  },
  update: (id: number, data: { title?: string; author?: string; description?: string }) => {
    const stmt = db.prepare('UPDATE books SET title = COALESCE(?, title), author = COALESCE(?, author), description = COALESCE(?, description) WHERE id = ?');
    stmt.run(data.title, data.author, data.description, id);
    return db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  },
  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  },
  getPaginated: (page: number, limit: number) => {
    const offset = (page - 1) * limit;
    return db.prepare('SELECT * FROM books LIMIT ? OFFSET ?').all(limit, offset);
  },
  checkDuplicate: ({ title, author }: { title: string; author: string }) => {
    const result = db.prepare('SELECT 1 FROM books WHERE title = ? AND author = ?').get(title, author);
    return !!result;
  },
};

export const genreOperations = {
  getAll: () => db.prepare('SELECT * FROM genres').all(),
  getById: (id: number) => db.prepare('SELECT * FROM genres WHERE id = ?').get(id),
  create: ({ name, description }: { name: string; description?: string }) => {
    const stmt = db.prepare('INSERT INTO genres (id, name, description) VALUES (?, ?, ?)');
    const id = uuidv4();
    stmt.run(id, name, description || null);
    return { id, name, description: description || null };
  },
  update: (id: number, data: { name?: string; description?: string }) => {
    const stmt = db.prepare('UPDATE genres SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?');
    stmt.run(data.name, data.description, id);
    return db.prepare('SELECT * FROM genres WHERE id = ?').get(id);
  },
  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM genres WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  },
};

export const readingListOperations = {
  getByIdWithBooks: (id: number) => {
    type DbList = {
      id: string; name: string; description: string | null; is_public: number; user_id: string;
      created_at: string; updated_at: string; books?: unknown[]; book_count?: number
    } | undefined;
    const list = db.prepare('SELECT * FROM reading_lists WHERE id = ?').get(id) as unknown as DbList;
    if (!list) return null;
    type DbBookRow = {
      id: string; title: string; author: string; description: string | null;
      created_at: string; updated_at: string; rlb_id: string; position: number; notes: string | null; added_at: string
    };
    const books = db.prepare(
      `SELECT b.*, rlb.id as rlb_id, rlb.position, rlb.notes, rlb.added_at
       FROM reading_list_books rlb
       JOIN books b ON b.id = rlb.book_id
       WHERE rlb.reading_list_id = ?
       ORDER BY rlb.position ASC`
    ).all(id) as unknown as DbBookRow[];
    list.books = books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description,
      created_at: b.created_at,
      updated_at: b.updated_at,
      reading_list_book: {
        id: b.rlb_id,
        reading_list_id: id,
        book_id: b.id,
        position: b.position,
        notes: b.notes,
        added_at: b.added_at,
      },
      genres: [],
    }));
    list.book_count = list.books.length;
    return list;
  },
  getById: (id: number) => db.prepare('SELECT * FROM reading_lists WHERE id = ?').get(id),
  getByUser: (userId: number) => db.prepare('SELECT * FROM reading_lists WHERE user_id = ?').all(userId),
  getPublic: () => db.prepare('SELECT * FROM reading_lists WHERE is_public = 1').all(),
  create: ({ name, description, is_public, user_id }: { name: string; description?: string | null; is_public?: boolean; user_id: number }) => {
    const stmt = db.prepare('INSERT INTO reading_lists (id, name, description, is_public, user_id) VALUES (?, ?, ?, ?, ?)');
    const id = uuidv4();
    stmt.run(id, name, description || null, is_public ? 1 : 0, user_id);
    return db.prepare('SELECT * FROM reading_lists WHERE id = ?').get(id);
  },
  update: (id: number, data: { name?: string; description?: string | null; is_public?: boolean }) => {
    const stmt = db.prepare('UPDATE reading_lists SET name = COALESCE(?, name), description = COALESCE(?, description), is_public = COALESCE(?, is_public) WHERE id = ?');
    stmt.run(data.name, data.description, data.is_public !== undefined ? (data.is_public ? 1 : 0) : undefined, id);
    return db.prepare('SELECT * FROM reading_lists WHERE id = ?').get(id);
  },
  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM reading_lists WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  },
  addBook: (readingListId: number, bookId: number, position = 0, notes?: string) => {
    const stmt = db.prepare('INSERT INTO reading_list_books (id, reading_list_id, book_id, position, notes) VALUES (?, ?, ?, ?, ?)');
    const id = uuidv4();
    stmt.run(id, readingListId, bookId, position, notes || null);
    return { id, reading_list_id: readingListId, book_id: bookId, position, notes: notes || null, added_at: new Date().toISOString() };
  },
  removeBook: (readingListId: number, bookId: number) => {
    const stmt = db.prepare('DELETE FROM reading_list_books WHERE reading_list_id = ? AND book_id = ?');
    const info = stmt.run(readingListId, bookId);
    return info.changes > 0;
  },
  getBookInList: (readingListId: number, bookId: number) => db.prepare('SELECT * FROM reading_list_books WHERE reading_list_id = ? AND book_id = ?').get(readingListId, bookId),
  updateBookInList: (readingListId: number, bookId: number, data: { position?: number; notes?: string | null }) => {
    const stmt = db.prepare('UPDATE reading_list_books SET position = COALESCE(?, position), notes = COALESCE(?, notes) WHERE reading_list_id = ? AND book_id = ?');
    stmt.run(data.position, data.notes, readingListId, bookId);
    return db.prepare('SELECT * FROM reading_list_books WHERE reading_list_id = ? AND book_id = ?').get(readingListId, bookId);
  },
};

export const userBookAssociationOperations = {
  getByUser: (userId: number) => db.prepare('SELECT * FROM user_book_associations WHERE user_id = ?').all(userId),
  getReadBooksWithPagination: (userId: number, page: number, pageSize: number) => {
    const offset = (page - 1) * pageSize;
    return db.prepare(
      'SELECT * FROM user_book_associations WHERE user_id = ? AND read_status = "read" LIMIT ? OFFSET ?'
    ).all(userId, pageSize, offset);
  },
  getByUserAndBook: (userId: string, bookId: string) => db.prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?').get(userId, bookId),
  upsert: (userId: number, bookId: number, data: { read_status?: 'unread' | 'reading' | 'read'; rating?: number; comments?: string }) => {
    type DbUBA = { id: string } | undefined;
    const existing = db.prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?').get(userId, bookId) as unknown as DbUBA;
    if (existing) {
      const stmt = db.prepare('UPDATE user_book_associations SET read_status = COALESCE(?, read_status), rating = COALESCE(?, rating), comments = COALESCE(?, comments) WHERE id = ?');
      stmt.run(data.read_status, data.rating, data.comments, existing.id);
      return db.prepare('SELECT * FROM user_book_associations WHERE id = ?').get(existing.id);
    }
    const id = uuidv4();
    const stmt = db.prepare('INSERT INTO user_book_associations (id, user_id, book_id, read_status, rating, comments) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(id, userId, bookId, data.read_status || 'unread', data.rating || null, data.comments || null);
    return db.prepare('SELECT * FROM user_book_associations WHERE id = ?').get(id);
  },
  update: (userId: string, bookId: string, data: { read_status?: 'unread' | 'reading' | 'read'; rating?: number; comments?: string }) => {
    type DbUBA = { id: string } | undefined;
    const existing = db.prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?').get(userId, bookId) as unknown as DbUBA;
    if (!existing) return null;
    const stmt = db.prepare('UPDATE user_book_associations SET read_status = COALESCE(?, read_status), rating = COALESCE(?, rating), comments = COALESCE(?, comments) WHERE id = ?');
    stmt.run(data.read_status, data.rating, data.comments, existing.id);
    return db.prepare('SELECT * FROM user_book_associations WHERE id = ?').get(existing.id);
  },
  delete: (userId: string, bookId: string) => {
    const stmt = db.prepare('DELETE FROM user_book_associations WHERE user_id = ? AND book_id = ?');
    const info = stmt.run(userId, bookId);
    return info.changes > 0;
  },
};

// Provide a getDatabase for compatibility
export const getDatabase = () => db;
