import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Connect to the database
const dbPath = path.join(process.cwd(), 'data', 'books.db');
const db = new Database(dbPath);

console.log('Starting complete database refresh...');

try {
  // Begin transaction
  db.exec('BEGIN TRANSACTION');

  // Drop all existing tables
  console.log('Dropping existing tables...');
  db.exec('DROP TABLE IF EXISTS reading_list_books');
  db.exec('DROP TABLE IF EXISTS reading_lists');
  db.exec('DROP TABLE IF EXISTS book_genres');
  db.exec('DROP TABLE IF EXISTS user_book_associations');
  db.exec('DROP TABLE IF EXISTS books');
  db.exec('DROP TABLE IF EXISTS genres');
  db.exec('DROP TABLE IF EXISTS users');

  // Create users table
  console.log('Creating users table...');
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create genres table
  console.log('Creating genres table...');
  db.exec(`
    CREATE TABLE genres (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create books table
  console.log('Creating books table...');
  db.exec(`
    CREATE TABLE books (
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

  // Create book_genres table
  console.log('Creating book_genres table...');
  db.exec(`
    CREATE TABLE book_genres (
      book_id TEXT NOT NULL,
      genre_id TEXT NOT NULL,
      PRIMARY KEY (book_id, genre_id),
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
    )
  `);

  // Create user_book_associations table
  console.log('Creating user_book_associations table...');
  db.exec(`
    CREATE TABLE user_book_associations (
      user_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'want_to_read',
      rating INTEGER,
      review TEXT,
      date_read DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, book_id),
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
    )
  `);

  // Create reading_lists table
  console.log('Creating reading_lists table...');
  db.exec(`
    CREATE TABLE reading_lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      is_public INTEGER DEFAULT 0,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create reading_list_books table
  console.log('Creating reading_list_books table...');
  db.exec(`
    CREATE TABLE reading_list_books (
      id TEXT PRIMARY KEY,
      reading_list_id TEXT NOT NULL,
      book_id TEXT NOT NULL,
      position INTEGER NOT NULL,
      notes TEXT,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reading_list_id) REFERENCES reading_lists (id) ON DELETE CASCADE,
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
      UNIQUE(reading_list_id, book_id)
    )
  `);

  // Create indexes
  console.log('Creating indexes...');
  db.exec('CREATE INDEX idx_books_title ON books(title)');
  db.exec('CREATE INDEX idx_books_author ON books(author)');
  db.exec('CREATE INDEX idx_genres_name ON genres(name)');
  db.exec('CREATE INDEX idx_user_book_status ON user_book_associations(status)');
  db.exec('CREATE INDEX idx_reading_lists_user ON reading_lists(user_id)');
  db.exec('CREATE INDEX idx_reading_list_books_list ON reading_list_books(reading_list_id)');

  // Insert admin user
  console.log('Inserting admin user...');
  const adminUserId = 'admin-user-id';
  db.prepare(`
    INSERT INTO users (id, username, email, password_hash)
    VALUES (?, ?, ?, ?)
  `).run(adminUserId, 'admin', 'admin@example.com', 'dummy-hash');

  // Insert genres
  console.log('Inserting genres...');
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
    { name: 'Nonfiction', description: 'Factual works based on real events, people, or information rather than fictional stories.' },
    { name: 'Fiction', description: 'Imaginative works of prose that are not based on real events or people, including novels, short stories, and novellas.' },
    { name: 'Tragedy', description: 'Dramatic works that depict the downfall of a noble character due to a tragic flaw or fate, often ending in death or destruction.' }
  ];

  const genreMap: Record<string, string> = {};
  const insertGenre = db.prepare('INSERT INTO genres (id, name, description) VALUES (?, ?, ?)');
  
  genres.forEach((genre) => {
    const genreId = uuidv4();
    genreMap[genre.name] = genreId;
    insertGenre.run(genreId, genre.name, genre.description);
  });

  // Insert books
  console.log('Inserting books...');
  const books = [
    ['The Great Gatsby', 'F. Scott Fitzgerald', 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', '978-0743273565', 180, 'English', 'Scribner', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg', '1925-04-10', 'Classic'],
    ['To Kill a Mockingbird', 'Harper Lee', 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.', '978-0446310789', 281, 'English', 'Grand Central Publishing', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg', '1960-07-11', 'Classic'],
    ['1984', 'George Orwell', 'A dystopian novel about totalitarianism and surveillance society.', '978-0451524935', 328, 'English', 'Signet Classic', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg', '1949-06-08', 'Dystopian'],
    ['Pride and Prejudice', 'Jane Austen', 'A romantic novel of manners that follows the emotional development of Elizabeth Bennet.', '978-0141439518', 432, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg', '1813-01-28', 'Romance'],
    ['The Catcher in the Rye', 'J.D. Salinger', 'A novel about teenage alienation and loss of innocence in post-World War II America.', '978-0316769488', 277, 'English', 'Little, Brown and Company', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg', '1951-07-16', 'Classic'],
    ['Lord of the Flies', 'William Golding', 'A novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.', '978-0399501487', 182, 'English', 'Penguin Books', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327869409i/7624.jpg', '1954-09-17', 'Classic'],
    ['Animal Farm', 'George Orwell', 'An allegorical novella about a group of farm animals who rebel against their human farmer.', '978-0451526342', 112, 'English', 'Signet', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/7613.jpg', '1945-08-17', 'Satire'],
    ['The Hobbit', 'J.R.R. Tolkien', 'A fantasy novel about a hobbit who embarks on a quest to reclaim a dwarf kingdom.', '978-0547928241', 366, 'English', 'Houghton Mifflin Harcourt', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg', '1937-09-21', 'Fantasy'],
    ['The Lord of the Rings', 'J.R.R. Tolkien', 'An epic high-fantasy novel about the quest to destroy a powerful ring.', '978-0547928210', 1216, 'English', 'Houghton Mifflin Harcourt', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg', '1954-07-29', 'Fantasy'],
    ['Jane Eyre', 'Charlotte Brontë', 'A novel about a young governess who falls in love with her mysterious employer.', '978-0141441146', 532, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327867269i/10210.jpg', '1847-10-16', 'Romance'],
    ['Wuthering Heights', 'Emily Brontë', 'A novel about the intense and passionate love between Catherine Earnshaw and Heathcliff.', '978-0141439556', 464, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872220i/6185.jpg', '1847-12-19', 'Romance'],
    ['Moby-Dick', 'Herman Melville', 'A novel about Captain Ahab\'s obsessive quest to kill the white whale Moby Dick.', '978-0142437247', 625, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/153747.jpg', '1851-10-18', 'Adventure'],
    ['The Adventures of Huckleberry Finn', 'Mark Twain', 'A novel about a young boy and a runaway slave traveling down the Mississippi River.', '978-0142437179', 327, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546096879i/2956.jpg', '1884-12-10', 'Adventure'],
    ['The Adventures of Tom Sawyer', 'Mark Twain', 'A novel about a young boy growing up along the Mississippi River.', '978-0143039563', 244, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1404811974i/99107.jpg', '1876-06-01', 'Adventure'],
    ['Little Women', 'Louisa May Alcott', 'A novel about four sisters growing up in America in the mid-1800s.', '978-0140390698', 449, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/1934.jpg', '1868-09-30', 'Classic'],
    ['The Scarlet Letter', 'Nathaniel Hawthorne', 'A novel about a woman who must wear a scarlet letter as punishment for adultery.', '978-0142437261', 238, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/12296.jpg', '1850-03-16', 'Classic'],
    ['The Picture of Dorian Gray', 'Oscar Wilde', 'A novel about a man whose portrait ages while he remains young and beautiful.', '978-0141439570', 254, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546073416i/5297.jpg', '1890-07-01', 'Classic'],
    ['Dracula', 'Bram Stoker', 'A novel about Count Dracula\'s attempt to move from Transylvania to England.', '978-0141439846', 488, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387151694i/17245.jpg', '1897-05-26', 'Horror'],
    ['Frankenstein', 'Mary Shelley', 'A novel about a scientist who creates a monster and the consequences of his actions.', '978-0141439471', 280, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388462718i/18490.jpg', '1818-01-01', 'Horror'],
    ["Alice's Adventures in Wonderland", 'Lewis Carroll', 'A novel about a young girl who falls through a rabbit hole into a fantasy world.', '978-0141439761', 112, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872220i/11.jpg', '1865-11-26', 'Children'],
    ['Through the Looking-Glass', 'Lewis Carroll', 'A sequel to Alice\'s Adventures in Wonderland about Alice\'s journey through a mirror.', '978-0141439761', 128, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/830502.jpg', '1871-12-27', 'Children'],
    ['The Call of the Wild', 'Jack London', 'A novel about a dog named Buck who is stolen from his home and sold into service as a sled dog.', '978-0142437735', 172, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/890.jpg', '1903-08-01', 'Adventure'],
    ['White Fang', 'Jack London', 'A novel about a wolf-dog hybrid who learns to survive in the harsh Yukon Territory.', '978-0142437797', 272, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/43035.jpg', '1906-05-01', 'Adventure'],
    ['The Time Machine', 'H.G. Wells', 'A science fiction novel about a time traveler who journeys to the distant future.', '978-0141439976', 118, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2493.jpg', '1895-01-01', 'Science Fiction'],
    ['The War of the Worlds', 'H.G. Wells', 'A science fiction novel about an invasion of Earth by Martians.', '978-0141441030', 192, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/8909.jpg', '1898-01-01', 'Science Fiction'],
    ['The Invisible Man', 'H.G. Wells', 'A science fiction novel about a scientist who discovers how to make himself invisible.', '978-0141439976', 192, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/17184.jpg', '1897-01-01', 'Science Fiction'],
    ['The Island of Doctor Moreau', 'H.G. Wells', 'A science fiction novel about a shipwrecked man who discovers an island where animals are being turned into humans.', '978-0141439976', 160, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/8908.jpg', '1896-01-01', 'Science Fiction'],
    ['The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 'A novel about a doctor who creates a potion that transforms him into a monster.', '978-0141439730', 144, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/51496.jpg', '1886-01-05', 'Horror'],
    ['Treasure Island', 'Robert Louis Stevenson', 'A novel about a young boy who finds a treasure map and sets sail for an island.', '978-0142439730', 311, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/295.jpg', '1883-05-23', 'Adventure'],
    ['Kidnapped', 'Robert Louis Stevenson', 'A novel about a young man who is kidnapped and sold into slavery.', '978-0142439730', 288, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2958.jpg', '1886-07-01', 'Adventure'],
    ['The Count of Monte Cristo', 'Alexandre Dumas', 'A novel about a man who is wrongfully imprisoned and seeks revenge.', '978-0140439151', 1276, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611834134i/7126.jpg', '1844-08-28', 'Adventure'],
    ['The Three Musketeers', 'Alexandre Dumas', 'A novel about a young man who joins the Musketeers of the Guard.', '978-0140439243', 704, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634158558i/7190.jpg', '1844-03-14', 'Adventure'],
    ['Les Misérables', 'Victor Hugo', 'A novel about the struggles of ex-convict Jean Valjean and his quest for redemption.', '978-0140444308', 1488, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634159334i/24280.jpg', '1862-01-01', 'Historical'],
    ['The Hunchback of Notre-Dame', 'Victor Hugo', 'A novel about a deformed bell-ringer who falls in love with a beautiful gypsy.', '978-0140443530', 624, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2612.jpg', '1831-01-14', 'Historical'],
    ['Madame Bovary', 'Gustave Flaubert', 'A novel about a woman who seeks escape from the banalities and emptiness of provincial life.', '978-0140449129', 528, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2175.jpg', '1857-01-01', 'Classic'],
    ['Anna Karenina', 'Leo Tolstoy', 'A novel about the tragic love affair between Anna Karenina and Count Vronsky.', '978-0143035008', 864, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1609198133i/15823480.jpg', '1877-01-01', 'Romance'],
    ['War and Peace', 'Leo Tolstoy', 'A novel about Russian society during the Napoleonic era.', '978-0143039990', 1392, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1413215930i/656.jpg', '1869-01-01', 'Historical'],
    ['Crime and Punishment', 'Fyodor Dostoevsky', 'A novel about a young man who commits murder and the psychological consequences.', '978-0143058144', 671, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg', '1866-01-01', 'Classic'],
    ['The Brothers Karamazov', 'Fyodor Dostoevsky', 'A novel about the murder of a father and the impact on his sons.', '978-0140449242', 796, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1427728126i/4934.jpg', '1880-01-01', 'Classic'],
    ['The Idiot', 'Fyodor Dostoevsky', 'A novel about a young man who is considered an idiot but possesses great moral purity.', '978-0140447927', 656, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/12505.jpg', '1869-01-01', 'Classic'],
    ['Notes from Underground', 'Fyodor Dostoevsky', 'A novel about a bitter, isolated man who lives in St. Petersburg.', '978-0140444919', 136, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/119679.jpg', '1864-01-01', 'Classic'],
    ['Don Quixote', 'Miguel de Cervantes', 'A novel about a man who reads too many chivalric romances and decides to become a knight.', '978-0142437230', 1023, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/3836.jpg', '1605-01-01', 'Classic'],
    ['The Divine Comedy', 'Dante Alighieri', 'An epic poem about the author\'s journey through Hell, Purgatory, and Paradise.', '978-0142437223', 928, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/6656.jpg', '1320-01-01', 'Poetry'],
    ['The Canterbury Tales', 'Geoffrey Chaucer', 'A collection of stories told by pilgrims on their way to Canterbury.', '978-0140422344', 504, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/13837.jpg', '1400-01-01', 'Poetry'],
    ['Paradise Lost', 'John Milton', 'An epic poem about the fall of man and the rebellion of Satan.', '978-0140424393', 453, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/15997.jpg', '1667-01-01', 'Poetry'],
    ['Robinson Crusoe', 'Daniel Defoe', 'A novel about a man who is shipwrecked on a desert island for 28 years.', '978-0141439822', 320, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2932.jpg', '1719-04-25', 'Adventure'],
    ['Gulliver\'s Travels', 'Jonathan Swift', 'A satirical novel about a man who travels to various fantastical lands.', '978-0141439495', 336, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/7733.jpg', '1726-10-28', 'Satire'],
    ['Candide', 'Voltaire', 'A satirical novel about a young man who is taught that everything is for the best.', '978-0140440041', 144, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/57532.jpg', '1759-01-01', 'Satire'],
    ['The Sorrows of Young Werther', 'Johann Wolfgang von Goethe', 'A novel about a young artist who falls in love with a woman already engaged.', '978-0140445039', 176, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16631.jpg', '1774-01-01', 'Romance'],
    ['Faust', 'Johann Wolfgang von Goethe', 'A tragic play about a scholar who makes a pact with the devil.', '978-0140449013', 288, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16632.jpg', '1808-01-01', 'Drama'],
    ['The Red and the Black', 'Stendhal', 'A novel about a young man who tries to rise above his station in life.', '978-0140447644', 640, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16633.jpg', '1830-01-01', 'Classic'],
    ['The Charterhouse of Parma', 'Stendhal', 'A novel about a young Italian nobleman during the Napoleonic era.', '978-0140449242', 544, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16634.jpg', '1839-01-01', 'Historical'],
    ['Eugene Onegin', 'Alexander Pushkin', 'A novel in verse about a young man who rejects a woman\'s love and later regrets it.', '978-0140448033', 240, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16635.jpg', '1833-01-01', 'Poetry'],
    ['Dead Souls', 'Nikolai Gogol', 'A novel about a man who buys dead serfs to improve his social standing.', '978-0140448071', 464, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16636.jpg', '1842-01-01', 'Satire'],
    ['The Overcoat', 'Nikolai Gogol', 'A short story about a poor government clerk who saves money to buy a new overcoat.', '978-0140448071', 96, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16637.jpg', '1842-01-01', 'Classic'],
    ['Fathers and Sons', 'Ivan Turgenev', 'A novel about the conflict between generations in 19th-century Russia.', '978-0140448033', 256, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16638.jpg', '1862-01-01', 'Classic']
  ];

  const bookMap: Record<string, string> = {};
  const insertBook = db.prepare(`
    INSERT INTO books (id, title, author, description, isbn, page_count, language, publisher, cover_image_url, publication_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  books.forEach((book) => {
    const bookId = uuidv4();
    const [title, author, description, isbn, pageCount, language, publisher, coverImageUrl, publicationDate, primaryGenre] = book;
    bookMap[title] = bookId;
    
    insertBook.run(bookId, title, author, description, isbn, pageCount, language, publisher, coverImageUrl, publicationDate);
    
    // Add primary genre association
    if (primaryGenre && genreMap[primaryGenre]) {
      db.prepare(`
        INSERT INTO book_genres (book_id, genre_id)
        VALUES (?, ?)
      `).run(bookId, genreMap[primaryGenre]);
    }
  });

  // Create a sample reading list
  console.log('Creating sample reading list...');
  const readingListId = '45a236c7-7b98-4f1c-8ae2-2ce774b291f1';
  db.prepare(`
    INSERT INTO reading_lists (id, name, description, is_public, user_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(readingListId, 'Next Up', 'Books I want to read next', 0, adminUserId);

  // Add some books to the reading list
  const sampleBooks = ['The Great Gatsby', 'To Kill a Mockingbird', '1984'];
  sampleBooks.forEach((title, index) => {
    if (bookMap[title]) {
      const readingListBookId = uuidv4();
      db.prepare(`
        INSERT INTO reading_list_books (id, reading_list_id, book_id, position, notes)
        VALUES (?, ?, ?, ?, ?)
      `).run(readingListBookId, readingListId, bookMap[title], index + 1, null);
    }
  });

  // Commit transaction
  db.exec('COMMIT');
  
  console.log('Database refresh completed successfully!');
  console.log(`Created ${genres.length} genres, ${books.length} books, and a sample reading list`);
  
} catch (error) {
  console.error('Database refresh failed:', error);
  db.exec('ROLLBACK');
  process.exit(1);
} finally {
  db.close();
}
