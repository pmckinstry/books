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

type TableColumn = { name: string; notnull: 0 | 1 };
const userTableInfo = db.prepare('PRAGMA table_info(users)').all() as TableColumn[];
const userTableColumns = new Set(userTableInfo.map((col) => col.name));
const userTableSchema = {
  hasPassword: userTableColumns.has('password'),
  hasPasswordHash: userTableColumns.has('password_hash'),
  hasNickname: userTableColumns.has('nickname'),
  hasEmail: userTableColumns.has('email'),
};

function getUserPasswordColumn() {
  if (userTableSchema.hasPasswordHash) return 'password_hash';
  if (userTableSchema.hasPassword) return 'password';
  return null;
}

const userBookAssociationTableInfo = db.prepare('PRAGMA table_info(user_book_associations)').all() as TableColumn[];
const userBookAssociationColumns = new Set(userBookAssociationTableInfo.map((col) => col.name));
const userBookAssociationSchema = {
  hasId: userBookAssociationColumns.has('id'),
  hasReadStatus: userBookAssociationColumns.has('read_status'),
  hasStatus: userBookAssociationColumns.has('status'),
  hasComments: userBookAssociationColumns.has('comments'),
  hasReview: userBookAssociationColumns.has('review'),
  hasRating: userBookAssociationColumns.has('rating'),
  hasDateRead: userBookAssociationColumns.has('date_read'),
  hasCreatedAt: userBookAssociationColumns.has('created_at'),
  hasUpdatedAt: userBookAssociationColumns.has('updated_at'),
};

const userBookAssociationStatusColumn = userBookAssociationSchema.hasReadStatus
  ? 'read_status'
  : userBookAssociationSchema.hasStatus
    ? 'status'
    : null;

const userBookAssociationCommentsColumn = userBookAssociationSchema.hasComments
  ? 'comments'
  : userBookAssociationSchema.hasReview
    ? 'review'
    : null;
const userBookAssociationStatusValues =
  userBookAssociationSchema.hasReadStatus || userBookAssociationSchema.hasStatus
    ? ['unread', 'reading', 'read']
    : ['want_to_read', 'reading', 'read', 'unread'];

type DbUserBookAssociationRow = Record<string, unknown> | undefined;

type NormalizedUserBookAssociation = {
  id: string;
  user_id: string;
  book_id: string;
  read_status: 'unread' | 'reading' | 'read';
  rating: number | null;
  comments: string | null;
  created_at: string | null;
  updated_at: string | null;
  date_read: string | null;
};

const normalizeUserBookAssociation = (row: DbUserBookAssociationRow): NormalizedUserBookAssociation | null => {
  if (!row) return null;
  const record = row as Record<string, unknown>;
  const readStatusRaw = userBookAssociationStatusColumn
    ? record[userBookAssociationStatusColumn]
    : record.read_status ?? record.status;
  const readStatus = typeof readStatusRaw === 'string' ? readStatusRaw.toLowerCase() : 'unread';
  const normalizedReadStatus: NormalizedUserBookAssociation['read_status'] =
    readStatus === 'read' || readStatus === 'reading'
      ? readStatus
      : 'unread';

  const commentsRaw = userBookAssociationCommentsColumn
    ? record[userBookAssociationCommentsColumn]
    : record.comments ?? record.review;
  const ratingRaw = record.rating;

  return {
    id: typeof record.id === 'string' ? record.id : `${record.user_id}:${record.book_id}`,
    user_id: String(record.user_id),
    book_id: String(record.book_id),
    read_status: normalizedReadStatus,
    rating: typeof ratingRaw === 'number' ? ratingRaw : ratingRaw === null ? null : null,
    comments: typeof commentsRaw === 'string' ? commentsRaw : null,
    created_at: typeof record.created_at === 'string' ? record.created_at : null,
    updated_at: typeof record.updated_at === 'string' ? record.updated_at : null,
    date_read: typeof record.date_read === 'string' ? record.date_read : null,
  };
};

// SQLite implementations of the operations
export const userOperations = {
  getById: (id: string | number) => db.prepare('SELECT * FROM users WHERE id = ?').get(String(id)),
  create: async ({ username, password, nickname }: { username: string; password: string; nickname?: string }) => {
    const passwordColumn = getUserPasswordColumn();
    if (!passwordColumn) {
      throw new Error('Users table is missing a password column');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    const columns = ['id', 'username', passwordColumn];
    const values: unknown[] = [id, username, hashedPassword];

    if (userTableSchema.hasEmail) {
      columns.push('email');
      values.push(`${username}@example.com`);
    }

    if (userTableSchema.hasNickname) {
      columns.push('nickname');
      values.push(nickname || null);
    }

    const placeholders = columns.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders})`);
    stmt.run(...values);

    return {
      id,
      username,
      nickname: userTableSchema.hasNickname ? nickname || null : null,
    };
  },
  authenticate: async ({ username, password }: { username: string; password: string }) => {
    type DbUser = {
      id: string;
      username: string;
      password?: string;
      password_hash?: string;
      nickname?: string | null;
    } | undefined;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as unknown as DbUser;
    if (!user) return null;
    const hashedPassword = user.password ?? user.password_hash;
    if (!hashedPassword) {
      console.warn(`User ${username} is missing a password hash in SQLite`);
      return null;
    }
    const valid = await bcrypt.compare(password, hashedPassword);
    return valid ? { id: user.id, username: user.username, nickname: user.nickname ?? null } : null;
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

type DbBookRow = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  page_count: number | null;
  language: string | null;
  publisher: string | null;
  cover_image_url: string | null;
  publication_date: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  genre_id: string | null;
  genre_name: string | null;
  genre_description: string | null;
};

const baseBookSelect = `
  SELECT
    b.id,
    b.title,
    b.author,
    b.description,
    b.isbn,
    b.page_count,
    b.language,
    b.publisher,
    b.cover_image_url,
    b.publication_date,
    b.user_id,
    b.created_at,
    b.updated_at,
    bg.genre_id,
    g.name AS genre_name,
    g.description AS genre_description
  FROM books b
  LEFT JOIN book_genres bg ON b.id = bg.book_id
  LEFT JOIN genres g ON g.id = bg.genre_id
`;

type BookWithGenresResult = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  page_count: number | null;
  language: string | null;
  publisher: string | null;
  cover_image_url: string | null;
  publication_date: string | null;
  user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  genres: { id: string; name: string; description: string | null }[];
};

const mapBookRowsToBooks = (rows: DbBookRow[]): BookWithGenresResult[] => {
  const books = new Map<string, BookWithGenresResult>();
  for (const row of rows) {
    let book = books.get(row.id);
    if (!book) {
      book = {
        id: row.id,
        title: row.title,
        author: row.author,
        description: row.description ?? null,
        isbn: row.isbn ?? null,
        page_count: typeof row.page_count === 'number' ? row.page_count : null,
        language: row.language ?? null,
        publisher: row.publisher ?? null,
        cover_image_url: row.cover_image_url ?? null,
        publication_date: row.publication_date ?? null,
        user_id: row.user_id ?? null,
        created_at: row.created_at ?? null,
        updated_at: row.updated_at ?? null,
        genres: [],
      };
      books.set(row.id, book);
    }
    if (row.genre_id) {
      const alreadyPresent = book.genres.some((genre) => genre.id === row.genre_id);
      if (!alreadyPresent) {
        book.genres.push({
          id: row.genre_id,
          name: row.genre_name ?? '',
          description: row.genre_description ?? null,
        });
      }
    }
  }
  return Array.from(books.values());
};

const getCurrentTimestamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

const toTimestamp = (value: string | null) => {
  if (!value) return 0;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const candidate = /[Z+-]/.test(normalized.slice(-1)) ? normalized : `${normalized}Z`;
  const parsed = Date.parse(candidate);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getAllBooksWithGenres = (): BookWithGenresResult[] => {
  const rows = db
    .prepare(`${baseBookSelect} ORDER BY datetime(b.created_at) DESC, b.title COLLATE NOCASE`)
    .all() as DbBookRow[];
  return mapBookRowsToBooks(rows);
};

const getBookWithGenresById = (bookId: string | number): BookWithGenresResult | null => {
  const rows = db.prepare(`${baseBookSelect} WHERE b.id = ?`).all(String(bookId)) as DbBookRow[];
  const books = mapBookRowsToBooks(rows);
  return books.length > 0 ? books[0] : null;
};

const replaceBookGenres = (bookId: string, genreIds: Array<string | number>) => {
  const uniqueIds = Array.from(new Set(genreIds.map((id) => String(id).trim()).filter(Boolean)));
  const deleteStmt = db.prepare('DELETE FROM book_genres WHERE book_id = ?');
  const insertStmt = db.prepare('INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)');
  const applyGenres = db.transaction((id: string, ids: string[]) => {
    deleteStmt.run(id);
    for (const genreId of ids) {
      insertStmt.run(id, genreId);
    }
  });
  applyGenres(bookId, uniqueIds);
};

export const bookOperations = {
  create: async (data: { title: string; author: string; description?: string; isbn?: string; page_count?: number; language?: string; publisher?: string; cover_image_url?: string; publication_date?: string; user_id?: string }, genres: Array<string | number> = []) => {
    const id = uuidv4();
    const timestamp = getCurrentTimestamp();
    const stmt = db.prepare(
      `INSERT INTO books (
        id, title, author, description, isbn, page_count, language, publisher, cover_image_url, publication_date, user_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    stmt.run(
      id,
      data.title,
      data.author,
      data.description ?? null,
      data.isbn ?? null,
      data.page_count ?? null,
      data.language ?? 'English',
      data.publisher ?? null,
      data.cover_image_url ?? null,
      data.publication_date ?? null,
      data.user_id ?? null,
      timestamp,
      timestamp
    );
    replaceBookGenres(id, genres);
    return getBookWithGenresById(id);
  },
  getById: async (id: string | number) => getBookWithGenresById(id),
  getAll: async (limit?: number, offset = 0) => {
    const books = getAllBooksWithGenres();
    if (typeof limit === 'number' && limit >= 0) {
      const startIndex = offset > 0 ? offset : 0;
      return books.slice(startIndex, startIndex + limit);
    }
    return books;
  },
  getBooksWithPagination: async (
    page = 1,
    limit = 20,
    filters?: {
      search?: string;
      yearFrom?: number;
      yearTo?: number;
      language?: string;
      publisher?: string;
      pageCountFrom?: number;
      pageCountTo?: number;
      genreIds?: Array<string | number>;
    },
    sortBy: string = 'created_at',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) => {
    const allBooks = getAllBooksWithGenres();
    let filteredBooks = allBooks;

    if (filters) {
      if (filters.search && filters.search.trim()) {
        const term = filters.search.trim().toLowerCase();
        filteredBooks = filteredBooks.filter((book) => {
          const genreMatches = book.genres.some((genre) => genre.name.toLowerCase().includes(term));
          return (
            book.title.toLowerCase().includes(term) ||
            book.author.toLowerCase().includes(term) ||
            (book.description && book.description.toLowerCase().includes(term)) ||
            (book.isbn && book.isbn.toLowerCase().includes(term)) ||
            (book.language && book.language.toLowerCase().includes(term)) ||
            (book.publisher && book.publisher.toLowerCase().includes(term)) ||
            genreMatches
          );
        });
      }

      if (filters.yearFrom || filters.yearTo) {
        filteredBooks = filteredBooks.filter((book) => {
          if (!book.publication_date) return false;
          const year = parseInt(book.publication_date.substring(0, 4), 10);
          if (Number.isNaN(year)) return false;
          if (filters.yearFrom && year < filters.yearFrom) return false;
          if (filters.yearTo && year > filters.yearTo) return false;
          return true;
        });
      }

      if (filters.language && filters.language.trim()) {
        const languageTerm = filters.language.trim().toLowerCase();
        filteredBooks = filteredBooks.filter(
          (book) => (book.language ?? '').toLowerCase() === languageTerm
        );
      }

      if (filters.publisher && filters.publisher.trim()) {
        const publisherTerm = filters.publisher.trim().toLowerCase();
        filteredBooks = filteredBooks.filter(
          (book) => (book.publisher ?? '').toLowerCase() === publisherTerm
        );
      }

      if (typeof filters.pageCountFrom === 'number') {
        filteredBooks = filteredBooks.filter(
          (book) => typeof book.page_count === 'number' && book.page_count >= filters.pageCountFrom!
        );
      }

      if (typeof filters.pageCountTo === 'number') {
        filteredBooks = filteredBooks.filter(
          (book) => typeof book.page_count === 'number' && book.page_count <= filters.pageCountTo!
        );
      }

      if (filters.genreIds && filters.genreIds.length > 0) {
        const genreIdSet = new Set(filters.genreIds.map((id) => String(id)));
        filteredBooks = filteredBooks.filter((book) =>
          book.genres.some((genre) => genreIdSet.has(String(genre.id)))
        );
      }
    }

    const compareStrings = (a: string | null, b: string | null) => {
      const left = (a ?? '').toLowerCase();
      const right = (b ?? '').toLowerCase();
      return left.localeCompare(right);
    };

    const compareNumbers = (a: number | null, b: number | null) => {
      const left = typeof a === 'number' ? a : 0;
      const right = typeof b === 'number' ? b : 0;
      return left - right;
    };

    filteredBooks.sort((a, b) => {
      const direction = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'title':
          return compareStrings(a.title, b.title) * direction;
        case 'author':
          return compareStrings(a.author, b.author) * direction;
        case 'isbn':
          return compareStrings(a.isbn, b.isbn) * direction;
        case 'page_count':
          return compareNumbers(a.page_count, b.page_count) * direction;
        case 'language':
          return compareStrings(a.language, b.language) * direction;
        case 'publisher':
          return compareStrings(a.publisher, b.publisher) * direction;
        case 'created_at':
        default: {
          const aTime = toTimestamp(a.created_at);
          const bTime = toTimestamp(b.created_at);
          return (aTime - bTime) * direction;
        }
      }
    });

    const safeLimit = limit > 0 ? limit : filteredBooks.length || 1;
    const safePage = page > 0 ? page : 1;
    const total = filteredBooks.length;
    const totalPages = safeLimit > 0 ? Math.ceil(total / safeLimit) : 0;
    const startIndex = (safePage - 1) * safeLimit;
    const books = filteredBooks.slice(startIndex, startIndex + safeLimit);

    return {
      books,
      total,
      totalPages,
      hasMore: safePage < totalPages,
    };
  },
  checkDuplicate: (title: string, author: string, excludeId?: string | number) => {
    const params: Array<string> = [title.trim().toLowerCase(), author.trim().toLowerCase()];
    let query = 'SELECT id FROM books WHERE lower(title) = ? AND lower(author) = ?';
    if (excludeId !== undefined && excludeId !== null) {
      query += ' AND id <> ?';
      params.push(String(excludeId));
    }
    query += ' LIMIT 1';
    const row = db.prepare(query).get(...params) as { id: string } | undefined;
    return row ? getBookWithGenresById(row.id) : null;
  },
  update: async (
    id: string | number,
    data: {
      title?: string;
      author?: string;
      description?: string;
      isbn?: string;
      page_count?: number | null;
      language?: string;
      publisher?: string;
      cover_image_url?: string;
      publication_date?: string;
      genres?: Array<string | number>;
    }
  ) => {
    const bookId = String(id);
    const setClauses: string[] = [];
    const params: unknown[] = [];

    const appendClause = (column: string, value: unknown) => {
      setClauses.push(`${column} = ?`);
      params.push(value);
    };

    if (data.title !== undefined) appendClause('title', data.title);
    if (data.author !== undefined) appendClause('author', data.author);
    if (data.description !== undefined) appendClause('description', data.description ?? null);
    if (data.isbn !== undefined) appendClause('isbn', data.isbn ?? null);
    if (data.page_count !== undefined) appendClause('page_count', data.page_count ?? null);
    if (data.language !== undefined) appendClause('language', data.language ?? null);
    if (data.publisher !== undefined) appendClause('publisher', data.publisher ?? null);
    if (data.cover_image_url !== undefined) appendClause('cover_image_url', data.cover_image_url ?? null);
    if (data.publication_date !== undefined) appendClause('publication_date', data.publication_date ?? null);

    if (setClauses.length > 0) {
      appendClause('updated_at', getCurrentTimestamp());
      const updateStmt = db.prepare(`UPDATE books SET ${setClauses.join(', ')} WHERE id = ?`);
      updateStmt.run(...params, bookId);
    }

    if (data.genres) {
      replaceBookGenres(bookId, data.genres);
    }

    return getBookWithGenresById(bookId);
  },
  delete: async (id: string | number) => {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const info = stmt.run(String(id));
    return info.changes > 0;
  },
  getBooksByGenre: async (genreId: string | number) => {
    const rows = db
      .prepare(`${baseBookSelect} WHERE bg.genre_id = ? ORDER BY datetime(b.created_at) DESC, b.title COLLATE NOCASE`)
      .all(String(genreId)) as DbBookRow[];
    return mapBookRowsToBooks(rows);
  },
  getGenresForBook: async (bookId: string | number) => {
    const book = getBookWithGenresById(bookId);
    return book ? book.genres : [];
  },
  setGenres: async (bookId: string | number, genreIds: Array<string | number>) => {
    replaceBookGenres(String(bookId), genreIds);
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

type DbReadingListRow = {
  id: string;
  name: string;
  description: string | null;
  is_public: number | boolean | null;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
};

type ReadingListResult = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
  created_at: string | null;
  updated_at: string | null;
  books?: unknown[];
  book_count?: number;
};

const toBoolean = (value: unknown) => value === 1 || value === true;

const normalizeReadingList = (row: DbReadingListRow | undefined): ReadingListResult | null => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    is_public: toBoolean(row.is_public),
    user_id: String(row.user_id),
    created_at: row.created_at ?? null,
    updated_at: row.updated_at ?? null,
  };
};

const normalizeReadingLists = (rows: DbReadingListRow[]): ReadingListResult[] =>
  rows
    .map((row) => normalizeReadingList(row))
    .filter((list): list is ReadingListResult => list !== null);

export const readingListOperations = {
  getByIdWithBooks: (id: string | number) => {
    const rawList = db.prepare('SELECT * FROM reading_lists WHERE id = ?').get(String(id)) as DbReadingListRow | undefined;
    const list = normalizeReadingList(rawList);
    if (!list) return null;

    type DbBookRow = {
      id: string;
      title: string;
      author: string;
      description: string | null;
      created_at: string | null;
      updated_at: string | null;
      rlb_id: string;
      position: number;
      notes: string | null;
      added_at: string;
    };

    const books = db.prepare(
      `SELECT b.*, rlb.id as rlb_id, rlb.position, rlb.notes, rlb.added_at
       FROM reading_list_books rlb
       JOIN books b ON b.id = rlb.book_id
       WHERE rlb.reading_list_id = ?
       ORDER BY rlb.position ASC`
    ).all(String(id)) as DbBookRow[];

    const bookEntries = books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      description: b.description,
      created_at: b.created_at,
      updated_at: b.updated_at,
      reading_list_book: {
        id: b.rlb_id,
        reading_list_id: String(id),
        book_id: b.id,
        position: b.position,
        notes: b.notes,
        added_at: b.added_at,
      },
      genres: [],
    }));

    return {
      ...list,
      books: bookEntries,
      book_count: bookEntries.length,
    };
  },
  getById: (id: string | number) => {
    const row = db.prepare('SELECT * FROM reading_lists WHERE id = ?').get(String(id)) as DbReadingListRow | undefined;
    return normalizeReadingList(row);
  },
  getByUser: (userId: string | number) => {
    const rows = db.prepare('SELECT * FROM reading_lists WHERE user_id = ? ORDER BY datetime(created_at) DESC, name COLLATE NOCASE').all(String(userId)) as DbReadingListRow[];
    return normalizeReadingLists(rows);
  },
  getPublic: () => {
    const rows = db.prepare('SELECT * FROM reading_lists WHERE is_public = 1 ORDER BY datetime(created_at) DESC, name COLLATE NOCASE').all() as DbReadingListRow[];
    return normalizeReadingLists(rows);
  },
  create: ({ name, description, is_public, user_id }: { name: string; description?: string | null; is_public?: boolean; user_id: string | number }) => {
    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const existing = db
      .prepare('SELECT id FROM reading_lists WHERE user_id = ? AND lower(name) = lower(?) LIMIT 1')
      .get(String(user_id), trimmedName) as { id: string } | undefined;
    if (existing) {
      return null;
    }

    const id = uuidv4();
    const timestamp = getCurrentTimestamp();
    const stmt = db.prepare(
      'INSERT INTO reading_lists (id, name, description, is_public, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(
      id,
      trimmedName,
      description?.trim() || null,
      is_public ? 1 : 0,
      String(user_id),
      timestamp,
      timestamp
    );

    return readingListOperations.getById(id);
  },
  update: (id: string | number, data: { name?: string; description?: string | null; is_public?: boolean }) => {
    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      setClauses.push('name = ?');
      params.push(data.name?.trim() || null);
    }
    if (data.description !== undefined) {
      setClauses.push('description = ?');
      params.push(data.description?.trim() || null);
    }
    if (data.is_public !== undefined) {
      setClauses.push('is_public = ?');
      params.push(data.is_public ? 1 : 0);
    }

    if (setClauses.length > 0) {
      setClauses.push('updated_at = ?');
      params.push(getCurrentTimestamp());
      params.push(String(id));
      const stmt = db.prepare(`UPDATE reading_lists SET ${setClauses.join(', ')} WHERE id = ?`);
      stmt.run(...params);
    }

    return readingListOperations.getById(id);
  },
  delete: (id: string | number) => {
    const stmt = db.prepare('DELETE FROM reading_lists WHERE id = ?');
    const info = stmt.run(String(id));
    return info.changes > 0;
  },
  addBook: (readingListId: string | number, bookId: string | number, position = 0, notes?: string) => {
    const stmt = db.prepare('INSERT INTO reading_list_books (id, reading_list_id, book_id, position, notes) VALUES (?, ?, ?, ?, ?)');
    const id = uuidv4();
    stmt.run(id, String(readingListId), String(bookId), position, notes || null);
    return { id, reading_list_id: String(readingListId), book_id: String(bookId), position, notes: notes || null, added_at: new Date().toISOString() };
  },
  removeBook: (readingListId: string | number, bookId: string | number) => {
    const stmt = db.prepare('DELETE FROM reading_list_books WHERE reading_list_id = ? AND book_id = ?');
    const info = stmt.run(String(readingListId), String(bookId));
    return info.changes > 0;
  },
  getBookInList: (readingListId: string | number, bookId: string | number) =>
    db.prepare('SELECT * FROM reading_list_books WHERE reading_list_id = ? AND book_id = ?').get(String(readingListId), String(bookId)),
  updateBookInList: (readingListId: string | number, bookId: string | number, data: { position?: number; notes?: string | null }) => {
    const stmt = db.prepare('UPDATE reading_list_books SET position = COALESCE(?, position), notes = COALESCE(?, notes) WHERE reading_list_id = ? AND book_id = ?');
    stmt.run(data.position, data.notes, String(readingListId), String(bookId));
    return db.prepare('SELECT * FROM reading_list_books WHERE reading_list_id = ? AND book_id = ?').get(String(readingListId), String(bookId));
  },
};

export const userBookAssociationOperations = {
  getByUser: (userId: string | number) => {
    const rows = db.prepare('SELECT * FROM user_book_associations WHERE user_id = ?').all(String(userId));
    return rows
      .map((row) => normalizeUserBookAssociation(row as Record<string, unknown>))
      .filter((association): association is NormalizedUserBookAssociation => association !== null);
  },
  getReadBooksWithPagination: (
    userId: string | number,
    page = 1,
    limit = 10,
    sortBy = 'title',
    sortOrder: 'asc' | 'desc' = 'asc',
    search = ''
  ) => {
    if (!userBookAssociationStatusColumn) {
      console.warn('user_book_associations table is missing a status column');
      return { books: [], total: 0, totalPages: 0, hasMore: false };
    }

    const userIdText = String(userId);
    const associationRows = db.prepare(
      `SELECT * FROM user_book_associations WHERE user_id = ? AND ${userBookAssociationStatusColumn} = ?`
    ).all(userIdText, 'read');

    const associations = associationRows
      .map((row) => normalizeUserBookAssociation(row as Record<string, unknown>))
      .filter((association): association is NormalizedUserBookAssociation => association !== null);

    if (associations.length === 0) {
      return { books: [], total: 0, totalPages: 0, hasMore: false };
    }

    const booksWithAssociations = associations
      .map((association) => {
        const book = db.prepare('SELECT * FROM books WHERE id = ?').get(association.book_id) as Record<string, unknown> | undefined;
        if (!book) return null;
        const genres = db.prepare(
          `SELECT g.* FROM genres g
           INNER JOIN book_genres bg ON g.id = bg.genre_id
           WHERE bg.book_id = ?`
        ).all(association.book_id) as Record<string, unknown>[];
        return {
          ...book,
          genres,
          user_association: association,
        };
      })
      .filter((entry): entry is Record<string, unknown> & { user_association: NormalizedUserBookAssociation } => entry !== null);

    const trimmedSearch = search.trim().toLowerCase();
    let filteredBooks = booksWithAssociations;
    if (trimmedSearch) {
      filteredBooks = filteredBooks.filter((book) => {
        const title = typeof book.title === 'string' ? book.title.toLowerCase() : '';
        const author = typeof book.author === 'string' ? book.author.toLowerCase() : '';
        const description = typeof book.description === 'string' ? book.description.toLowerCase() : '';
        const genreText = Array.isArray(book.genres)
          ? book.genres
              .map((genre) => (typeof genre.name === 'string' ? genre.name.toLowerCase() : ''))
              .join(' ')
          : '';
        return (
          title.includes(trimmedSearch) ||
          author.includes(trimmedSearch) ||
          description.includes(trimmedSearch) ||
          genreText.includes(trimmedSearch)
        );
      });
    }

    filteredBooks.sort((a, b) => {
      const factor = sortOrder === 'desc' ? -1 : 1;
      const getString = (value: unknown) => (typeof value === 'string' ? value.toLowerCase() : '');
      const getNumber = (value: unknown) => (typeof value === 'number' ? value : 0);
      const getTimestamp = (value: unknown) => {
        if (typeof value === 'string') {
          const timestamp = Date.parse(value);
          return Number.isFinite(timestamp) ? timestamp : 0;
        }
        return 0;
      };

      switch (sortBy) {
        case 'author':
          return getString(a.author).localeCompare(getString(b.author)) * factor;
        case 'rating':
          return (getNumber(a.user_association.rating) - getNumber(b.user_association.rating)) * factor;
        case 'created_at':
          return (getTimestamp(a.user_association.created_at) - getTimestamp(b.user_association.created_at)) * factor;
        case 'updated_at':
          return (getTimestamp(a.user_association.updated_at) - getTimestamp(b.user_association.updated_at)) * factor;
        case 'title':
        default:
          return getString(a.title).localeCompare(getString(b.title)) * factor;
      }
    });

    const safePage = page > 0 ? page : 1;
    const safeLimit = limit > 0 ? limit : filteredBooks.length || 1;
    const total = filteredBooks.length;
    const totalPages = safeLimit > 0 ? Math.ceil(total / safeLimit) : 0;
    const startIndex = (safePage - 1) * safeLimit;
    const paginatedBooks = filteredBooks.slice(startIndex, startIndex + safeLimit);

    return {
      books: paginatedBooks,
      total,
      totalPages,
      hasMore: safePage < totalPages,
    };
  },
  getByUserAndBook: (userId: string | number, bookId: string | number) => {
    const row = db
      .prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?')
      .get(String(userId), String(bookId));
    return normalizeUserBookAssociation(row as Record<string, unknown> | undefined);
  },
  upsert: (data: { user_id: string | number; book_id: string | number; read_status?: 'unread' | 'reading' | 'read'; rating?: number; comments?: string }) => {
    const userIdText = String(data.user_id);
    const bookIdText = String(data.book_id);
    const existingRow = db
      .prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?')
      .get(userIdText, bookIdText) as Record<string, unknown> | undefined;

    const normalizedStatus: 'unread' | 'reading' | 'read' =
      data.read_status && ['unread', 'reading', 'read'].includes(data.read_status) ? data.read_status : 'unread';
    const ratingValue = data.rating ?? null;
    const commentsValue = data.comments ?? null;

    if (existingRow) {
      const setClauses: string[] = [];
      const params: unknown[] = [];

      if (userBookAssociationStatusColumn && data.read_status !== undefined) {
        setClauses.push(`${userBookAssociationStatusColumn} = ?`);
        params.push(normalizedStatus);
      }

      if (userBookAssociationSchema.hasRating && data.rating !== undefined) {
        setClauses.push('rating = ?');
        params.push(ratingValue);
      }

      if (userBookAssociationCommentsColumn && data.comments !== undefined) {
        setClauses.push(`${userBookAssociationCommentsColumn} = ?`);
        params.push(commentsValue);
      }

      if (userBookAssociationSchema.hasDateRead && data.read_status !== undefined) {
        const dateReadValue = normalizedStatus === 'read' ? new Date().toISOString().split('T')[0] : null;
        setClauses.push('date_read = ?');
        params.push(dateReadValue);
      }

      if (setClauses.length === 0) {
        return normalizeUserBookAssociation(existingRow);
      }

      if (userBookAssociationSchema.hasUpdatedAt) {
        setClauses.push('updated_at = CURRENT_TIMESTAMP');
      }

      params.push(userIdText, bookIdText);

      db.prepare(`UPDATE user_book_associations SET ${setClauses.join(', ')} WHERE user_id = ? AND book_id = ?`).run(...params);

      const updatedRow = db
        .prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?')
        .get(userIdText, bookIdText) as Record<string, unknown> | undefined;
      return normalizeUserBookAssociation(updatedRow);
    }

    const columns: string[] = [];
    const placeholders: string[] = [];
    const params: unknown[] = [];

    if (userBookAssociationSchema.hasId) {
      columns.push('id');
      placeholders.push('?');
      params.push(uuidv4());
    }

    columns.push('user_id');
    placeholders.push('?');
    params.push(userIdText);

    columns.push('book_id');
    placeholders.push('?');
    params.push(bookIdText);

    if (userBookAssociationStatusColumn) {
      columns.push(userBookAssociationStatusColumn);
      placeholders.push('?');
      params.push(normalizedStatus);
    }

    if (userBookAssociationSchema.hasRating) {
      columns.push('rating');
      placeholders.push('?');
      params.push(ratingValue);
    }

    if (userBookAssociationCommentsColumn) {
      columns.push(userBookAssociationCommentsColumn);
      placeholders.push('?');
      params.push(commentsValue);
    }

    if (userBookAssociationSchema.hasDateRead) {
      const dateReadValue = normalizedStatus === 'read' ? new Date().toISOString().split('T')[0] : null;
      columns.push('date_read');
      placeholders.push('?');
      params.push(dateReadValue);
    }

    const insertStatement = `INSERT INTO user_book_associations (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
    db.prepare(insertStatement).run(...params);

    const insertedRow = db
      .prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?')
      .get(userIdText, bookIdText) as Record<string, unknown> | undefined;
    return normalizeUserBookAssociation(insertedRow);
  },
  update: (
    userId: string | number,
    bookId: string | number,
    data: { read_status?: 'unread' | 'reading' | 'read'; rating?: number; comments?: string }
  ) => {
    const userIdText = String(userId);
    const bookIdText = String(bookId);
    const existingRow = db
      .prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?')
      .get(userIdText, bookIdText) as Record<string, unknown> | undefined;
    if (!existingRow) return null;

    const setClauses: string[] = [];
    const params: unknown[] = [];

    if (userBookAssociationStatusColumn && data.read_status !== undefined) {
      const normalizedStatus: 'unread' | 'reading' | 'read' =
        ['unread', 'reading', 'read'].includes(data.read_status) ? data.read_status : 'unread';
      setClauses.push(`${userBookAssociationStatusColumn} = ?`);
      params.push(normalizedStatus);
      if (userBookAssociationSchema.hasDateRead) {
        setClauses.push('date_read = ?');
        const dateReadValue = normalizedStatus === 'read' ? new Date().toISOString().split('T')[0] : null;
        params.push(dateReadValue);
      }
    }

    if (userBookAssociationSchema.hasRating && data.rating !== undefined) {
      setClauses.push('rating = ?');
      params.push(data.rating ?? null);
    }

    if (userBookAssociationCommentsColumn && data.comments !== undefined) {
      setClauses.push(`${userBookAssociationCommentsColumn} = ?`);
      params.push(data.comments ?? null);
    }

    if (setClauses.length === 0) {
      return normalizeUserBookAssociation(existingRow);
    }

    if (userBookAssociationSchema.hasUpdatedAt) {
      setClauses.push('updated_at = CURRENT_TIMESTAMP');
    }

    params.push(userIdText, bookIdText);
    db.prepare(`UPDATE user_book_associations SET ${setClauses.join(', ')} WHERE user_id = ? AND book_id = ?`).run(...params);

    const updatedRow = db
      .prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?')
      .get(userIdText, bookIdText) as Record<string, unknown> | undefined;
    return normalizeUserBookAssociation(updatedRow);
  },
  delete: (userId: string | number, bookId: string | number) => {
    const info = db
      .prepare('DELETE FROM user_book_associations WHERE user_id = ? AND book_id = ?')
      .run(String(userId), String(bookId));
    return info.changes > 0;
  },
};

// Provide a getDatabase for compatibility
export const getDatabase = () => db;
