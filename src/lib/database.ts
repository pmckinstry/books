import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      description TEXT,
      isbn TEXT,
      page_count INTEGER,
      language TEXT DEFAULT 'English',
      publisher TEXT,
      cover_image_url TEXT,
      publication_date DATE,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_book_associations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
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
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS book_genres (
      book_id INTEGER NOT NULL,
      genre_id INTEGER NOT NULL,
      PRIMARY KEY (book_id, genre_id),
      FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
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
      { name: 'Nonfiction', description: 'Factual works based on real events, people, or information rather than fictional stories.' }
    ];
    const genreMap: Record<string, number> = {};
    const insertGenre = db.prepare('INSERT INTO genres (name, description) VALUES (?, ?)');
    genres.forEach((genre) => {
      const result = insertGenre.run(genre.name, genre.description);
      genreMap[genre.name] = result.lastInsertRowid as number;
    });

    const insertBook = db.prepare(`
      INSERT INTO books (title, author, year, description, isbn, page_count, language, publisher, cover_image_url, publication_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertBookGenre = db.prepare(`
      INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)
    `);
    // Book data with all fields including new ones
    const popularBooks: Array<[string, string, number, string, string, number, string, string, string, string, string]> = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', '978-0743273565', 180, 'English', 'Scribner', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1490528560i/4671.jpg', '1925-04-10', 'Classic'],
      ['To Kill a Mockingbird', 'Harper Lee', 1960, 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.', '978-0446310789', 281, 'English', 'Grand Central Publishing', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1553383690i/2657.jpg', '1960-07-11', 'Classic'],
      ['1984', 'George Orwell', 1949, 'A dystopian novel about totalitarianism and surveillance society.', '978-0451524935', 328, 'English', 'Signet Classic', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1532714506i/40961427.jpg', '1949-06-08', 'Dystopian'],
      ['Pride and Prejudice', 'Jane Austen', 1813, 'A romantic novel of manners that follows the emotional development of Elizabeth Bennet.', '978-0141439518', 432, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320399351i/1885.jpg', '1813-01-28', 'Romance'],
      ['The Catcher in the Rye', 'J.D. Salinger', 1951, 'A novel about teenage alienation and loss of innocence in post-World War II America.', '978-0316769488', 277, 'English', 'Little, Brown and Company', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg', '1951-07-16', 'Classic'],
      ['Lord of the Flies', 'William Golding', 1954, 'A novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.', '978-0399501487', 182, 'English', 'Penguin Books', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327869409i/7624.jpg', '1954-09-17', 'Classic'],
      ['Animal Farm', 'George Orwell', 1945, 'An allegorical novella about a group of farm animals who rebel against their human farmer.', '978-0451526342', 112, 'English', 'Signet', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/7613.jpg', '1945-08-17', 'Satire'],
      ['The Hobbit', 'J.R.R. Tolkien', 1937, 'A fantasy novel about a hobbit who embarks on a quest to reclaim a dwarf kingdom.', '978-0547928241', 366, 'English', 'Houghton Mifflin Harcourt', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/5907.jpg', '1937-09-21', 'Fantasy'],
      ['The Lord of the Rings', 'J.R.R. Tolkien', 1954, 'An epic high-fantasy novel about the quest to destroy a powerful ring.', '978-0547928210', 1216, 'English', 'Houghton Mifflin Harcourt', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1566425108i/33.jpg', '1954-07-29', 'Fantasy'],
      ['Jane Eyre', 'Charlotte Brontë', 1847, 'A novel about a young governess who falls in love with her mysterious employer.', '978-0141441146', 532, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327867269i/10210.jpg', '1847-10-16', 'Romance'],
      ['Wuthering Heights', 'Emily Brontë', 1847, 'A novel about the intense and passionate love between Catherine Earnshaw and Heathcliff.', '978-0141439556', 464, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872220i/6185.jpg', '1847-12-19', 'Romance'],
      ['Moby-Dick', 'Herman Melville', 1851, 'A novel about Captain Ahab\'s obsessive quest to kill the white whale Moby Dick.', '978-0142437247', 625, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/153747.jpg', '1851-10-18', 'Adventure'],
      ['The Adventures of Huckleberry Finn', 'Mark Twain', 1884, 'A novel about a young boy and a runaway slave traveling down the Mississippi River.', '978-0142437179', 327, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546096879i/2956.jpg', '1884-12-10', 'Adventure'],
      ['The Adventures of Tom Sawyer', 'Mark Twain', 1876, 'A novel about a young boy growing up along the Mississippi River.', '978-0143039563', 244, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1404811974i/99107.jpg', '1876-06-01', 'Adventure'],
      ['Little Women', 'Louisa May Alcott', 1868, 'A novel about four sisters growing up in America in the mid-1800s.', '978-0140390698', 449, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/1934.jpg', '1868-09-30', 'Classic'],
      ['The Scarlet Letter', 'Nathaniel Hawthorne', 1850, 'A novel about a woman who must wear a scarlet letter as punishment for adultery.', '978-0142437261', 238, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/12296.jpg', '1850-03-16', 'Classic'],
      ['The Picture of Dorian Gray', 'Oscar Wilde', 1890, 'A novel about a man whose portrait ages while he remains young and beautiful.', '978-0141439570', 254, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546073416i/5297.jpg', '1890-07-01', 'Classic'],
      ['Dracula', 'Bram Stoker', 1897, 'A novel about Count Dracula\'s attempt to move from Transylvania to England.', '978-0141439846', 488, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1387151694i/17245.jpg', '1897-05-26', 'Horror'],
      ['Frankenstein', 'Mary Shelley', 1818, 'A novel about a scientist who creates a monster and the consequences of his actions.', '978-0141439471', 280, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1388462718i/18490.jpg', '1818-01-01', 'Horror'],
      ["Alice's Adventures in Wonderland", 'Lewis Carroll', 1865, 'A novel about a young girl who falls through a rabbit hole into a fantasy world.', '978-0141439761', 112, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327872220i/11.jpg', '1865-11-26', 'Children'],
      ['Through the Looking-Glass', 'Lewis Carroll', 1871, 'A sequel to Alice\'s Adventures in Wonderland about Alice\'s journey through a mirror.', '978-0141439761', 128, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/830502.jpg', '1871-12-27', 'Children'],
      ['The Call of the Wild', 'Jack London', 1903, 'A novel about a dog named Buck who is stolen from his home and sold into service as a sled dog.', '978-0142437735', 172, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/890.jpg', '1903-08-01', 'Adventure'],
      ['White Fang', 'Jack London', 1906, 'A novel about a wolf-dog hybrid who learns to survive in the harsh Yukon Territory.', '978-0142437797', 272, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/43035.jpg', '1906-05-01', 'Adventure'],
      ['The Time Machine', 'H.G. Wells', 1895, 'A science fiction novel about a time traveler who journeys to the distant future.', '978-0141439976', 118, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2493.jpg', '1895-01-01', 'Science Fiction'],
      ['The War of the Worlds', 'H.G. Wells', 1898, 'A science fiction novel about an invasion of Earth by Martians.', '978-0141441030', 192, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/8909.jpg', '1898-01-01', 'Science Fiction'],
      ['The Invisible Man', 'H.G. Wells', 1897, 'A science fiction novel about a scientist who discovers how to make himself invisible.', '978-0141439976', 192, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/17184.jpg', '1897-01-01', 'Science Fiction'],
      ['The Island of Doctor Moreau', 'H.G. Wells', 1896, 'A science fiction novel about a shipwrecked man who discovers an island where animals are being turned into humans.', '978-0141439976', 160, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/8908.jpg', '1896-01-01', 'Science Fiction'],
      ['The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 1886, 'A novel about a doctor who creates a potion that transforms him into a monster.', '978-0141439730', 144, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/51496.jpg', '1886-01-05', 'Horror'],
      ['Treasure Island', 'Robert Louis Stevenson', 1883, 'A novel about a young boy who finds a treasure map and sets sail for an island.', '978-0141439730', 311, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/295.jpg', '1883-05-23', 'Adventure'],
      ['Kidnapped', 'Robert Louis Stevenson', 1886, 'A novel about a young man who is kidnapped and sold into slavery.', '978-0141439730', 288, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2958.jpg', '1886-07-01', 'Adventure'],
      ['The Count of Monte Cristo', 'Alexandre Dumas', 1844, 'A novel about a man who is wrongfully imprisoned and seeks revenge.', '978-0140439151', 1276, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1611834134i/7126.jpg', '1844-08-28', 'Adventure'],
      ['The Three Musketeers', 'Alexandre Dumas', 1844, 'A novel about a young man who joins the Musketeers of the Guard.', '978-0140439243', 704, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634158558i/7190.jpg', '1844-03-14', 'Adventure'],
      ['Les Misérables', 'Victor Hugo', 1862, 'A novel about the struggles of ex-convict Jean Valjean and his quest for redemption.', '978-0140444308', 1488, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1634159334i/24280.jpg', '1862-01-01', 'Historical'],
      ['The Hunchback of Notre-Dame', 'Victor Hugo', 1831, 'A novel about a deformed bell-ringer who falls in love with a beautiful gypsy.', '978-0140443530', 624, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2612.jpg', '1831-01-14', 'Historical'],
      ['Madame Bovary', 'Gustave Flaubert', 1857, 'A novel about a woman who seeks escape from the banalities and emptiness of provincial life.', '978-0140449129', 528, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2175.jpg', '1857-01-01', 'Classic'],
      ['Anna Karenina', 'Leo Tolstoy', 1877, 'A novel about the tragic love affair between Anna Karenina and Count Vronsky.', '978-0143035008', 864, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1609198133i/15823480.jpg', '1877-01-01', 'Romance'],
      ['War and Peace', 'Leo Tolstoy', 1869, 'A novel about Russian society during the Napoleonic era.', '978-0143039990', 1392, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1413215930i/656.jpg', '1869-01-01', 'Historical'],
      ['Crime and Punishment', 'Fyodor Dostoevsky', 1866, 'A novel about a young man who commits murder and the psychological consequences.', '978-0143058144', 671, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1382846449i/7144.jpg', '1866-01-01', 'Classic'],
      ['The Brothers Karamazov', 'Fyodor Dostoevsky', 1880, 'A novel about the murder of a father and the impact on his sons.', '978-0140449242', 796, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1427728126i/4934.jpg', '1880-01-01', 'Classic'],
      ['The Idiot', 'Fyodor Dostoevsky', 1869, 'A novel about a young man who is considered an idiot but possesses great moral purity.', '978-0140447927', 656, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/12505.jpg', '1869-01-01', 'Classic'],
      ['Notes from Underground', 'Fyodor Dostoevsky', 1864, 'A novel about a bitter, isolated man who lives in St. Petersburg.', '978-0140444919', 136, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/119679.jpg', '1864-01-01', 'Classic'],
      ['Don Quixote', 'Miguel de Cervantes', 1605, 'A novel about a man who reads too many chivalric romances and decides to become a knight.', '978-0142437230', 1023, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1546071216i/3836.jpg', '1605-01-01', 'Classic'],
      ['The Divine Comedy', 'Dante Alighieri', 1320, 'An epic poem about the author\'s journey through Hell, Purgatory, and Paradise.', '978-0142437223', 928, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/6656.jpg', '1320-01-01', 'Poetry'],
      ['The Canterbury Tales', 'Geoffrey Chaucer', 1400, 'A collection of stories told by pilgrims on their way to Canterbury.', '978-0140422344', 504, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/13837.jpg', '1400-01-01', 'Poetry'],
      ['Paradise Lost', 'John Milton', 1667, 'An epic poem about the fall of man and the rebellion of Satan.', '978-0140424393', 453, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/15997.jpg', '1667-01-01', 'Poetry'],
      ['Robinson Crusoe', 'Daniel Defoe', 1719, 'A novel about a man who is shipwrecked on a desert island for 28 years.', '978-0141439822', 320, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2932.jpg', '1719-04-25', 'Adventure'],
      ['Gulliver\'s Travels', 'Jonathan Swift', 1726, 'A satirical novel about a man who travels to various fantastical lands.', '978-0141439495', 336, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/7733.jpg', '1726-10-28', 'Satire'],
      ['Candide', 'Voltaire', 1759, 'A satirical novel about a young man who is taught that everything is for the best.', '978-0140440041', 144, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/57532.jpg', '1759-01-01', 'Satire'],
      ['The Sorrows of Young Werther', 'Johann Wolfgang von Goethe', 1774, 'A novel about a young artist who falls in love with a woman already engaged.', '978-0140445039', 176, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16631.jpg', '1774-01-01', 'Romance'],
      ['Faust', 'Johann Wolfgang von Goethe', 1808, 'A tragic play about a scholar who makes a pact with the devil.', '978-0140449013', 288, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16632.jpg', '1808-01-01', 'Drama'],
      ['The Red and the Black', 'Stendhal', 1830, 'A novel about a young man who tries to rise above his station in life.', '978-0140447644', 640, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16633.jpg', '1830-01-01', 'Classic'],
      ['The Charterhouse of Parma', 'Stendhal', 1839, 'A novel about a young Italian nobleman during the Napoleonic era.', '978-0140449242', 544, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16634.jpg', '1839-01-01', 'Historical'],
      ['Eugene Onegin', 'Alexander Pushkin', 1833, 'A novel in verse about a young man who rejects a woman\'s love and later regrets it.', '978-0140448033', 240, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16635.jpg', '1833-01-01', 'Poetry'],
      ['Dead Souls', 'Nikolai Gogol', 1842, 'A novel about a man who buys dead serfs to improve his social standing.', '978-0140448071', 464, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16636.jpg', '1842-01-01', 'Satire'],
      ['The Overcoat', 'Nikolai Gogol', 1842, 'A short story about a poor government clerk who saves money to buy a new overcoat.', '978-0140448071', 96, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16637.jpg', '1842-01-01', 'Classic'],
      ['Fathers and Sons', 'Ivan Turgenev', 1862, 'A novel about the conflict between generations in 19th-century Russia.', '978-0140448033', 256, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16638.jpg', '1862-01-01', 'Classic'],
      ['A Hero of Our Time', 'Mikhail Lermontov', 1840, 'A novel about a bored and cynical young officer in the Russian army.', '978-0140447951', 160, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/16639.jpg', '1840-01-01', 'Classic'],
      ['The Master and Margarita', 'Mikhail Bulgakov', 1967, 'A novel about the devil visiting Moscow and the story of Pontius Pilate.', '978-0141180144', 480, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/117833.jpg', '1967-01-01', 'Fantasy'],
      ['One Hundred Years of Solitude', 'Gabriel García Márquez', 1967, 'A novel about the Buendía family over seven generations.', '978-0060883287', 417, 'English', 'Harper Perennial', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/320.jpg', '1967-06-05', 'Fantasy'],
      ['Love in the Time of Cholera', 'Gabriel García Márquez', 1985, 'A novel about a love triangle spanning fifty years.', '978-0307387262', 368, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9712.jpg', '1985-01-01', 'Romance'],
      ['The House of the Spirits', 'Isabel Allende', 1982, 'A novel about the Trueba family over four generations in Chile.', '978-0553383805', 432, 'English', 'Bantam', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9326.jpg', '1982-01-01', 'Fantasy'],
      ['Pedro Páramo', 'Juan Rulfo', 1955, 'A novel about a man who visits his father\'s hometown and finds it inhabited by ghosts.', '978-0802133908', 124, 'English', 'Grove Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9327.jpg', '1955-01-01', 'Fantasy'],
      ['The Aleph', 'Jorge Luis Borges', 1949, 'A collection of short stories exploring themes of infinity and reality.', '978-0142437889', 208, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9328.jpg', '1949-01-01', 'Fantasy'],
      ['Ficciones', 'Jorge Luis Borges', 1944, 'A collection of short stories that blend fantasy and reality.', '978-0802130303', 174, 'English', 'Grove Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9329.jpg', '1944-01-01', 'Fantasy'],
      ['The Labyrinth of Solitude', 'Octavio Paz', 1950, 'An essay about Mexican identity and culture.', '978-0802133885', 212, 'English', 'Grove Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9330.jpg', '1950-01-01', 'Nonfiction'],
      ['The Death of Artemio Cruz', 'Carlos Fuentes', 1962, 'A novel about a dying man reflecting on his life during the Mexican Revolution.', '978-0374530817', 320, 'English', 'Farrar, Straus and Giroux', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9331.jpg', '1962-01-01', 'Historical'],
      ['Hopscotch', 'Julio Cortázar', 1963, 'A novel that can be read in multiple orders, exploring themes of chance and choice.', '978-0811218479', 576, 'English', 'New Directions', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9332.jpg', '1963-01-01', 'Classic'],
      ['The Tunnel', 'Ernesto Sabato', 1948, 'A novel about an artist who becomes obsessed with a woman he sees at an exhibition.', '978-0141180144', 160, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/9333.jpg', '1948-01-01', 'Classic'],
      ['The Plague', 'Albert Camus', 1947, 'A novel about a plague that strikes the Algerian city of Oran.', '978-0679720218', 308, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11989.jpg', '1947-01-01', 'Classic'],
      ['The Stranger', 'Albert Camus', 1942, 'A novel about a man who kills an Arab and faces the absurdity of life.', '978-0679720201', 123, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1590930002i/49552.jpg', '1942-01-01', 'Classic'],
      ['The Myth of Sisyphus', 'Albert Camus', 1942, 'An essay about the absurd and the meaning of life.', '978-0679720201', 212, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11990.jpg', '1942-01-01', 'Philosophy'],
      ['The Fall', 'Albert Camus', 1956, 'A novel about a lawyer who confesses his guilt to a stranger.', '978-0679720225', 147, 'English', 'Vintage', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11991.jpg', '1956-01-01', 'Classic'],
      ['Nausea', 'Jean-Paul Sartre', 1938, 'A novel about a man who experiences existential nausea and alienation.', '978-0811201884', 178, 'English', 'New Directions', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11992.jpg', '1938-01-01', 'Classic'],
      ['Being and Nothingness', 'Jean-Paul Sartre', 1943, 'A philosophical work about existentialism and consciousness.', '978-0671867805', 688, 'English', 'Washington Square Press', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/11993.jpg', '1943-01-01', 'Philosophy'],
      ['The Little Prince', 'Antoine de Saint-Exupéry', 1943, 'A children\'s book about a young prince who visits various planets.', '978-0156013987', 96, 'English', 'Harcourt', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/157993.jpg', '1943-04-06', 'Children'],
      ['The Old Man and the Sea', 'Ernest Hemingway', 1952, 'A novel about an old fisherman\'s struggle with a giant marlin.', '978-0684801223', 128, 'English', 'Scribner', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2165.jpg', '1952-09-01', 'Classic'],
      ['For Whom the Bell Tolls', 'Ernest Hemingway', 1940, 'A novel about an American fighting in the Spanish Civil War.', '978-0684803357', 480, 'English', 'Scribner', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2166.jpg', '1940-10-21', 'Historical'],
      ['A Farewell to Arms', 'Ernest Hemingway', 1929, 'A novel about an American ambulance driver in Italy during World War I.', '978-0684801469', 332, 'English', 'Scribner', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2167.jpg', '1929-09-27', 'Historical'],
      ['The Sun Also Rises', 'Ernest Hemingway', 1926, 'A novel about American expatriates in Paris and Spain after World War I.', '978-0684800714', 251, 'English', 'Scribner', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/2168.jpg', '1926-10-22', 'Classic'],
      ['The Grapes of Wrath', 'John Steinbeck', 1939, 'A novel about a family of tenant farmers during the Great Depression.', '978-0143039433', 464, 'English', 'Penguin Classics', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/18114322.jpg', '1939-04-14', 'Historical'],
      ['Of Mice and Men', 'John Steinbeck', 1937, 'A novel about two displaced migrant ranch workers during the Great Depression.', '978-0140177398', 112, 'English', 'Penguin Books', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1511302084i/890.jpg', '1937-01-01', 'Classic'],
      ['East of Eden', 'John Steinbeck', 1952, 'A novel about two families in the Salinas Valley in California.', '978-0142004234', 601, 'English', 'Penguin Books', 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1327942880i/4406.jpg', '1952-09-19', 'Classic']
    ];
    for (const [title, author, year, description, isbn, page_count, language, publisher, cover_image_url, publication_date, genre] of popularBooks) {
      const result = insertBook.run(title, author, year, description, isbn, page_count, language, publisher, cover_image_url, publication_date);
      const bookId = result.lastInsertRowid as number;
      insertBookGenre.run(bookId, genreMap[genre]);
    }
  }

  // Create default admin user if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    const insertUser = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    insertUser.run('admin', hashedPassword);
  }
}

// Initialize the database
initializeDatabase();

export interface User {
  id: number;
  username: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface UserBookAssociation {
  id: number;
  user_id: number;
  book_id: number;
  read_status: 'unread' | 'reading' | 'read';
  rating?: number;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  year: number;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  user_id?: number;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
  nickname?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface CreateUserBookAssociationData {
  user_id: number;
  book_id: number;
  read_status?: 'unread' | 'reading' | 'read';
  rating?: number;
  comments?: string;
}

export interface UpdateUserBookAssociationData {
  read_status?: 'unread' | 'reading' | 'read';
  rating?: number;
  comments?: string;
}

export interface Genre {
  id: number;
  name: string;
  description?: string;
}

export interface BookWithGenres extends Book {
  genres: Genre[];
}

function getGenresForBook(bookId: number): Genre[] {
  const stmt = db.prepare(`
    SELECT g.id, g.name, g.description FROM genres g
    INNER JOIN book_genres bg ON g.id = bg.genre_id
    WHERE bg.book_id = ?
    ORDER BY g.name
  `);
  return stmt.all(bookId) as Genre[];
}

// User operations
export const userOperations = {
  // Create a new user
  create: async (data: CreateUserData): Promise<User | null> => {
    try {
      const hashedPassword = bcrypt.hashSync(data.password, 10);
      const stmt = db.prepare('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)');
      const result = stmt.run(data.username, hashedPassword, data.nickname || data.username);
      
      // Return the created user (without password)
      const user = db.prepare('SELECT id, username, nickname, created_at, updated_at FROM users WHERE id = ?').get(result.lastInsertRowid as number) as User;
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  // Authenticate user
  authenticate: async (data: LoginData): Promise<User | null> => {
    try {
      const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
      const user = stmt.get(data.username) as any;
      
      if (!user) return null;
      
      const isValid = bcrypt.compareSync(data.password, user.password);
      if (!isValid) return null;
      
      // Return user without password
      return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  // Get user by ID
  getById: (id: number): User | null => {
    try {
      const stmt = db.prepare('SELECT id, username, nickname, created_at, updated_at FROM users WHERE id = ?');
      const user = stmt.get(id) as User | undefined;
      return user || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Check if username exists
  usernameExists: (username: string): boolean => {
    try {
      const stmt = db.prepare('SELECT COUNT(*) as count FROM users WHERE username = ?');
      const result = stmt.get(username) as { count: number };
      return result.count > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  },

  // Update user profile
  updateProfile: async (userId: number, data: { nickname?: string }): Promise<User | null> => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.nickname !== undefined) {
        updates.push('nickname = ?');
        values.push(data.nickname);
      }

      if (updates.length === 0) {
        return userOperations.getById(userId);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const stmt = db.prepare(`
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = ?
      `);
      stmt.run(...values);

      return userOperations.getById(userId);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  }
};

// User-Book Association operations
export const userBookAssociationOperations = {
  // Create or update a user-book association
  upsert: (data: CreateUserBookAssociationData): UserBookAssociation => {
    const stmt = db.prepare(`
      INSERT INTO user_book_associations (user_id, book_id, read_status, rating, comments)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, book_id) DO UPDATE SET
        read_status = COALESCE(?, read_status),
        rating = COALESCE(?, rating),
        comments = COALESCE(?, comments),
        updated_at = CURRENT_TIMESTAMP
    `);
    
    const result = stmt.run(
      data.user_id, 
      data.book_id, 
      data.read_status || 'unread',
      data.rating || null,
      data.comments || null,
      data.read_status || null,
      data.rating || null,
      data.comments || null
    );
    
    // Return the created/updated association
    return userBookAssociationOperations.getByUserAndBook(data.user_id, data.book_id)!;
  },

  // Get association by user and book
  getByUserAndBook: (userId: number, bookId: number): UserBookAssociation | null => {
    try {
      const stmt = db.prepare('SELECT * FROM user_book_associations WHERE user_id = ? AND book_id = ?');
      const association = stmt.get(userId, bookId) as UserBookAssociation | undefined;
      return association || null;
    } catch (error) {
      console.error('Error getting user-book association:', error);
      return null;
    }
  },

  // Get all associations for a user
  getByUser: (userId: number): UserBookAssociation[] => {
    try {
      const stmt = db.prepare('SELECT * FROM user_book_associations WHERE user_id = ? ORDER BY updated_at DESC');
      return stmt.all(userId) as UserBookAssociation[];
    } catch (error) {
      console.error('Error getting user associations:', error);
      return [];
    }
  },

  // Update an existing association
  update: (userId: number, bookId: number, data: UpdateUserBookAssociationData): UserBookAssociation | null => {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (data.read_status !== undefined) {
        updates.push('read_status = ?');
        values.push(data.read_status);
      }
      if (data.rating !== undefined) {
        updates.push('rating = ?');
        values.push(data.rating);
      }
      if (data.comments !== undefined) {
        updates.push('comments = ?');
        values.push(data.comments);
      }

      if (updates.length === 0) {
        return userBookAssociationOperations.getByUserAndBook(userId, bookId);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId, bookId);

      const stmt = db.prepare(`
        UPDATE user_book_associations 
        SET ${updates.join(', ')} 
        WHERE user_id = ? AND book_id = ?
      `);
      stmt.run(...values);

      return userBookAssociationOperations.getByUserAndBook(userId, bookId);
    } catch (error) {
      console.error('Error updating user-book association:', error);
      return null;
    }
  },

  // Delete an association
  delete: (userId: number, bookId: number): boolean => {
    try {
      const stmt = db.prepare('DELETE FROM user_book_associations WHERE user_id = ? AND book_id = ?');
      const result = stmt.run(userId, bookId);
      return result.changes > 0;
    } catch (error) {
      console.error('Error deleting user-book association:', error);
      return false;
    }
  },

  // Get books with user associations (for display)
  getBooksWithUserAssociations: (userId: number, page: number = 1, limit: number = 10): { books: (Book & { user_association?: UserBookAssociation })[], total: number, totalPages: number } => {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const countStmt = db.prepare('SELECT COUNT(*) as count FROM books');
      const total = (countStmt.get() as { count: number }).count;
      
      // Get paginated books with user associations
      const stmt = db.prepare(`
        SELECT b.*, uba.*
        FROM books b
        LEFT JOIN user_book_associations uba ON b.id = uba.book_id AND uba.user_id = ?
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `);
      
      const results = stmt.all(userId, limit, offset) as any[];
      
      const books = results.map(row => ({
        id: row.id,
        title: row.title,
        author: row.author,
        year: row.year,
        description: row.description,
        user_id: row.user_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        user_association: row.user_association_id ? {
          id: row.user_association_id,
          user_id: row.uba_user_id,
          book_id: row.uba_book_id,
          read_status: row.read_status,
          rating: row.rating,
          comments: row.comments,
          created_at: row.uba_created_at,
          updated_at: row.uba_updated_at
        } : undefined
      }));
      
      const totalPages = Math.ceil(total / limit);
      
      return { books, total, totalPages };
    } catch (error) {
      console.error('Error getting books with user associations:', error);
      return { books: [], total: 0, totalPages: 0 };
    }
  },

  // Get read books with pagination, search, and sorting
  getReadBooksWithPagination: (userId: number, page: number = 1, limit: number = 10, sortBy: string = 'title', sortOrder: 'asc' | 'desc' = 'asc', search?: string): { books: (BookWithGenres & { user_association?: UserBookAssociation })[], total: number, totalPages: number } => {
    try {
      const offset = (page - 1) * limit;
      
      // Validate sortBy parameter
      const validSortFields = ['title', 'author', 'year', 'updated_at', 'isbn', 'page_count', 'language'];
      const validSortOrders = ['asc', 'desc'];
      
      if (!validSortFields.includes(sortBy)) {
        sortBy = 'title';
      }
      if (!validSortOrders.includes(sortOrder)) {
        sortOrder = 'asc';
      }
      
      let whereClause = 'WHERE uba.user_id = ? AND uba.read_status = \'read\'';
      let searchParams: any[] = [userId];
      
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        whereClause += `
          AND (b.title LIKE ? 
          OR b.author LIKE ? 
          OR b.year LIKE ? 
          OR b.description LIKE ?
          OR b.isbn LIKE ?
          OR b.language LIKE ?
          OR b.publisher LIKE ?
          OR EXISTS (
            SELECT 1 FROM book_genres bg 
            JOIN genres g ON bg.genre_id = g.id 
            WHERE bg.book_id = b.id AND g.name LIKE ?
          ))
        `;
        searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      // Get total count with search
      const countStmt = db.prepare(`
        SELECT COUNT(DISTINCT b.id) as count 
        FROM books b
        INNER JOIN user_book_associations uba ON b.id = uba.book_id
        ${whereClause}
      `);
      const total = (countStmt.get(...searchParams) as { count: number }).count;
      
      // Get paginated read books with search and sorting
      const stmt = db.prepare(`
        SELECT DISTINCT 
          b.id, b.title, b.author, b.year, b.description, b.user_id, b.created_at, b.updated_at,
          uba.id as uba_id, uba.user_id as uba_user_id, uba.book_id as uba_book_id, 
          uba.read_status as uba_read_status, uba.rating as uba_rating, 
          uba.comments as uba_comments, uba.created_at as uba_created_at, uba.updated_at as uba_updated_at
        FROM books b
        INNER JOIN user_book_associations uba ON b.id = uba.book_id
        ${whereClause}
        ORDER BY b.${sortBy} ${sortOrder.toUpperCase()} 
        LIMIT ? OFFSET ?
      `);
      
      const results = stmt.all(...searchParams, limit, offset) as any[];
      
      const books = results.map(row => ({
        id: row.id,
        title: row.title,
        author: row.author,
        year: row.year,
        description: row.description,
        user_id: row.user_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        genres: getGenresForBook(row.id),
        user_association: {
          id: row.uba_id,
          user_id: row.uba_user_id,
          book_id: row.uba_book_id,
          read_status: row.uba_read_status,
          rating: row.uba_rating,
          comments: row.uba_comments,
          created_at: row.uba_created_at,
          updated_at: row.uba_updated_at
        }
      }));
      
      const totalPages = Math.ceil(total / limit);
      
      return { books, total, totalPages };
    } catch (error) {
      console.error('Error getting read books with pagination:', error);
      return { books: [], total: 0, totalPages: 0 };
    }
  }
};

// Book CRUD operations
export const bookOperations = {
  // Get all books
  getAll: (): BookWithGenres[] => {
    const stmt = db.prepare('SELECT * FROM books ORDER BY created_at DESC');
    const books = stmt.all() as Book[];
    return books.map(book => ({ ...book, genres: getGenresForBook(book.id) }));
  },

  // Get paginated books
  getPaginated: (page: number = 1, limit: number = 10, sortBy: string = 'created_at', sortOrder: 'asc' | 'desc' = 'desc', search?: string): { books: BookWithGenres[], total: number, totalPages: number } => {
    const offset = (page - 1) * limit;
    
    // Validate sortBy parameter
    const validSortFields = ['title', 'author', 'year', 'created_at', 'isbn', 'page_count', 'language'];
    const validSortOrders = ['asc', 'desc'];
    
    if (!validSortFields.includes(sortBy)) {
      sortBy = 'created_at';
    }
    if (!validSortOrders.includes(sortOrder)) {
      sortOrder = 'desc';
    }
    
    let whereClause = '';
    let searchParams: any[] = [];
    
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereClause = `
        WHERE b.title LIKE ? 
        OR b.author LIKE ? 
        OR b.year LIKE ? 
        OR b.description LIKE ?
        OR b.isbn LIKE ?
        OR b.language LIKE ?
        OR b.publisher LIKE ?
        OR EXISTS (
          SELECT 1 FROM book_genres bg 
          JOIN genres g ON bg.genre_id = g.id 
          WHERE bg.book_id = b.id AND g.name LIKE ?
        )
      `;
      searchParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
    }
    
    // Get total count with search
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM books b ${whereClause}`);
    const total = (countStmt.get(...searchParams) as { count: number }).count;
    
    // Get paginated books with search and sorting
    const stmt = db.prepare(`
      SELECT DISTINCT b.* FROM books b 
      ${whereClause}
      ORDER BY b.${sortBy} ${sortOrder.toUpperCase()} 
      LIMIT ? OFFSET ?
    `);
    const books = stmt.all(...searchParams, limit, offset) as Book[];
    
    const totalPages = Math.ceil(total / limit);
    
    return { books: books.map(book => ({ ...book, genres: getGenresForBook(book.id) })), total, totalPages };
  },

  // Get a single book by ID
  getById: (id: number): BookWithGenres | null => {
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get(id) as Book | undefined;
    if (!book) return null;
    return { ...book, genres: getGenresForBook(book.id) };
  },

  // Create a new book
  create: (data: CreateBookData): Book => {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, year, description, isbn, page_count, language, publisher, cover_image_url, publication_date, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      data.title, 
      data.author, 
      data.year, 
      data.description, 
      data.isbn, 
      data.page_count, 
      data.language, 
      data.publisher, 
      data.cover_image_url, 
      data.publication_date, 
      data.user_id
    );
    
    // Return the created book
    return bookOperations.getById(result.lastInsertRowid as number)!;
  },

  // Update a book
  update: (id: number, data: UpdateBookData): Book | null => {
    const book = bookOperations.getById(id);
    if (!book) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.author !== undefined) {
      updates.push('author = ?');
      values.push(data.author);
    }
    if (data.year !== undefined) {
      updates.push('year = ?');
      values.push(data.year);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.isbn !== undefined) {
      updates.push('isbn = ?');
      values.push(data.isbn);
    }
    if (data.page_count !== undefined) {
      updates.push('page_count = ?');
      values.push(data.page_count);
    }
    if (data.language !== undefined) {
      updates.push('language = ?');
      values.push(data.language);
    }
    if (data.publisher !== undefined) {
      updates.push('publisher = ?');
      values.push(data.publisher);
    }
    if (data.cover_image_url !== undefined) {
      updates.push('cover_image_url = ?');
      values.push(data.cover_image_url);
    }
    if (data.publication_date !== undefined) {
      updates.push('publication_date = ?');
      values.push(data.publication_date);
    }

    if (updates.length === 0) return book;

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE books 
      SET ${updates.join(', ')} 
      WHERE id = ?
    `);
    stmt.run(...values);

    return bookOperations.getById(id);
  },

  // Delete a book
  delete: (id: number): boolean => {
    const stmt = db.prepare('DELETE FROM books WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

export function getBooksForGenre(genreId: number) {
  const stmt = db.prepare(`
    SELECT b.* FROM books b
    INNER JOIN book_genres bg ON b.id = bg.book_id
    WHERE bg.genre_id = ?
    ORDER BY b.title
  `);
  return stmt.all(genreId) as Book[];
}
// Initialize the database
initializeDatabase();
