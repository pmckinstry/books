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
      INSERT INTO books (title, author, year, description) 
      VALUES (?, ?, ?, ?)
    `);
    const insertBookGenre = db.prepare(`
      INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)
    `);
    // Book data with primary genre
    const popularBooks: [string, string, number, string, string][] = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 'Classic'],
      ['To Kill a Mockingbird', 'Harper Lee', 1960, 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.', 'Classic'],
      ['1984', 'George Orwell', 1949, 'A dystopian novel about totalitarianism and surveillance society.', 'Dystopian'],
      ['Pride and Prejudice', 'Jane Austen', 1813, 'A romantic novel of manners that follows the emotional development of Elizabeth Bennet.', 'Romance'],
      ['The Catcher in the Rye', 'J.D. Salinger', 1951, 'A novel about teenage alienation and loss of innocence in post-World War II America.', 'Classic'],
      ['Lord of the Flies', 'William Golding', 1954, 'A novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.', 'Classic'],
      ['Animal Farm', 'George Orwell', 1945, 'An allegorical novella about a group of farm animals who rebel against their human farmer.', 'Satire'],
      ['The Hobbit', 'J.R.R. Tolkien', 1937, 'A fantasy novel about a hobbit who embarks on a quest to reclaim a dwarf kingdom.', 'Fantasy'],
      ['The Lord of the Rings', 'J.R.R. Tolkien', 1954, 'An epic high-fantasy novel about the quest to destroy a powerful ring.', 'Fantasy'],
      ['Jane Eyre', 'Charlotte Brontë', 1847, 'A novel about a young governess who falls in love with her mysterious employer.', 'Romance'],
      ['Wuthering Heights', 'Emily Brontë', 1847, 'A novel about the intense and passionate love between Catherine Earnshaw and Heathcliff.', 'Romance'],
      ['Moby-Dick', 'Herman Melville', 1851, 'A novel about Captain Ahab\'s obsessive quest to kill the white whale Moby Dick.', 'Adventure'],
      ['The Adventures of Huckleberry Finn', 'Mark Twain', 1884, 'A novel about a young boy and a runaway slave traveling down the Mississippi River.', 'Adventure'],
      ['The Adventures of Tom Sawyer', 'Mark Twain', 1876, 'A novel about a young boy growing up along the Mississippi River.', 'Adventure'],
      ['Little Women', 'Louisa May Alcott', 1868, 'A novel about four sisters growing up in America in the mid-1800s.', 'Classic'],
      ['The Scarlet Letter', 'Nathaniel Hawthorne', 1850, 'A novel about a woman who must wear a scarlet letter as punishment for adultery.', 'Classic'],
      ['The Picture of Dorian Gray', 'Oscar Wilde', 1890, 'A novel about a man whose portrait ages while he remains young and beautiful.', 'Classic'],
      ['Dracula', 'Bram Stoker', 1897, 'A novel about Count Dracula\'s attempt to move from Transylvania to England.', 'Horror'],
      ['Frankenstein', 'Mary Shelley', 1818, 'A novel about a scientist who creates a monster and the consequences of his actions.', 'Horror'],
      ["Alice's Adventures in Wonderland", 'Lewis Carroll', 1865, 'A novel about a young girl who falls through a rabbit hole into a fantasy world.', 'Children'],
      ['Through the Looking-Glass', 'Lewis Carroll', 1871, 'A sequel to Alice\'s Adventures in Wonderland about Alice\'s journey through a mirror.', 'Children'],
      ['The Call of the Wild', 'Jack London', 1903, 'A novel about a dog named Buck who is stolen from his home and sold into service as a sled dog.', 'Adventure'],
      ['White Fang', 'Jack London', 1906, 'A novel about a wolf-dog hybrid who learns to survive in the harsh Yukon Territory.', 'Adventure'],
      ['The Time Machine', 'H.G. Wells', 1895, 'A science fiction novel about a time traveler who journeys to the distant future.', 'Science Fiction'],
      ['The War of the Worlds', 'H.G. Wells', 1898, 'A science fiction novel about an invasion of Earth by Martians.', 'Science Fiction'],
      ['The Invisible Man', 'H.G. Wells', 1897, 'A science fiction novel about a scientist who discovers how to make himself invisible.', 'Science Fiction'],
      ['The Island of Doctor Moreau', 'H.G. Wells', 1896, 'A science fiction novel about a shipwrecked man who discovers an island where animals are being turned into humans.', 'Science Fiction'],
      ['The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 1886, 'A novel about a doctor who creates a potion that transforms him into a monster.', 'Horror'],
      ['Treasure Island', 'Robert Louis Stevenson', 1883, 'A novel about a young boy who finds a treasure map and sets sail for an island.', 'Adventure'],
      ['Kidnapped', 'Robert Louis Stevenson', 1886, 'A novel about a young man who is kidnapped and sold into slavery.', 'Adventure'],
      ['The Count of Monte Cristo', 'Alexandre Dumas', 1844, 'A novel about a man who is wrongfully imprisoned and seeks revenge.', 'Adventure'],
      ['The Three Musketeers', 'Alexandre Dumas', 1844, 'A novel about a young man who joins the Musketeers of the Guard.', 'Adventure'],
      ['Les Misérables', 'Victor Hugo', 1862, 'A novel about the struggles of ex-convict Jean Valjean and his quest for redemption.', 'Historical'],
      ['The Hunchback of Notre-Dame', 'Victor Hugo', 1831, 'A novel about a deformed bell-ringer who falls in love with a beautiful gypsy.', 'Historical'],
      ['Madame Bovary', 'Gustave Flaubert', 1857, 'A novel about a woman who seeks escape from the banalities and emptiness of provincial life.', 'Classic'],
      ['Anna Karenina', 'Leo Tolstoy', 1877, 'A novel about the tragic love affair between Anna Karenina and Count Vronsky.', 'Romance'],
      ['War and Peace', 'Leo Tolstoy', 1869, 'A novel about Russian society during the Napoleonic era.', 'Historical'],
      ['Crime and Punishment', 'Fyodor Dostoevsky', 1866, 'A novel about a young man who commits murder and the psychological consequences.', 'Classic'],
      ['The Brothers Karamazov', 'Fyodor Dostoevsky', 1880, 'A novel about the murder of a father and the impact on his sons.', 'Classic'],
      ['The Idiot', 'Fyodor Dostoevsky', 1869, 'A novel about a young man who is considered an idiot but possesses great moral purity.', 'Classic'],
      ['Notes from Underground', 'Fyodor Dostoevsky', 1864, 'A novel about a bitter, isolated man who lives in St. Petersburg.', 'Classic'],
      ['Don Quixote', 'Miguel de Cervantes', 1605, 'A novel about a man who reads too many chivalric romances and decides to become a knight.', 'Classic'],
      ['The Divine Comedy', 'Dante Alighieri', 1320, 'An epic poem about the author\'s journey through Hell, Purgatory, and Paradise.', 'Poetry'],
      ['The Canterbury Tales', 'Geoffrey Chaucer', 1400, 'A collection of stories told by pilgrims on their way to Canterbury.', 'Poetry'],
      ['Paradise Lost', 'John Milton', 1667, 'An epic poem about the fall of man and the rebellion of Satan.', 'Poetry'],
      ['Robinson Crusoe', 'Daniel Defoe', 1719, 'A novel about a man who is shipwrecked on a desert island for 28 years.', 'Adventure'],
      ['Gulliver\'s Travels', 'Jonathan Swift', 1726, 'A satirical novel about a man who travels to various fantastical lands.', 'Satire'],
      ['Candide', 'Voltaire', 1759, 'A satirical novel about a young man who is taught that everything is for the best.', 'Satire'],
      ['The Sorrows of Young Werther', 'Johann Wolfgang von Goethe', 1774, 'A novel about a young artist who falls in love with a woman already engaged.', 'Romance'],
      ['Faust', 'Johann Wolfgang von Goethe', 1808, 'A tragic play about a scholar who makes a pact with the devil.', 'Drama'],
      ['The Red and the Black', 'Stendhal', 1830, 'A novel about a young man who tries to rise above his station in life.', 'Classic'],
      ['The Charterhouse of Parma', 'Stendhal', 1839, 'A novel about a young Italian nobleman during the Napoleonic era.', 'Historical'],
      ['Eugene Onegin', 'Alexander Pushkin', 1833, 'A novel in verse about a young man who rejects a woman\'s love and later regrets it.', 'Poetry'],
      ['Dead Souls', 'Nikolai Gogol', 1842, 'A novel about a man who buys dead serfs to improve his social standing.', 'Satire'],
      ['The Overcoat', 'Nikolai Gogol', 1842, 'A short story about a poor government clerk who saves money to buy a new overcoat.', 'Classic'],
      ['Fathers and Sons', 'Ivan Turgenev', 1862, 'A novel about the conflict between generations in 19th-century Russia.', 'Classic'],
      ['A Hero of Our Time', 'Mikhail Lermontov', 1840, 'A novel about a bored and cynical young officer in the Russian army.', 'Classic'],
      ['The Master and Margarita', 'Mikhail Bulgakov', 1967, 'A novel about the devil visiting Moscow and the story of Pontius Pilate.', 'Fantasy'],
      ['One Hundred Years of Solitude', 'Gabriel García Márquez', 1967, 'A novel about the Buendía family over seven generations.', 'Fantasy'],
      ['Love in the Time of Cholera', 'Gabriel García Márquez', 1985, 'A novel about a love triangle spanning fifty years.', 'Romance'],
      ['The House of the Spirits', 'Isabel Allende', 1982, 'A novel about the Trueba family over four generations in Chile.', 'Fantasy'],
      ['Pedro Páramo', 'Juan Rulfo', 1955, 'A novel about a man who visits his father\'s hometown and finds it inhabited by ghosts.', 'Fantasy'],
      ['The Aleph', 'Jorge Luis Borges', 1949, 'A collection of short stories exploring themes of infinity and reality.', 'Fantasy'],
      ['Ficciones', 'Jorge Luis Borges', 1944, 'A collection of short stories that blend fantasy and reality.', 'Fantasy'],
      ['The Labyrinth of Solitude', 'Octavio Paz', 1950, 'An essay about Mexican identity and culture.', 'Nonfiction'],
      ['The Death of Artemio Cruz', 'Carlos Fuentes', 1962, 'A novel about a dying man reflecting on his life during the Mexican Revolution.', 'Historical'],
      ['Hopscotch', 'Julio Cortázar', 1963, 'A novel that can be read in multiple orders, exploring themes of chance and choice.', 'Classic'],
      ['The Tunnel', 'Ernesto Sabato', 1948, 'A novel about an artist who becomes obsessed with a woman he sees at an exhibition.', 'Classic'],
      ['The Plague', 'Albert Camus', 1947, 'A novel about a plague that strikes the Algerian city of Oran.', 'Classic'],
      ['The Stranger', 'Albert Camus', 1942, 'A novel about a man who kills an Arab and faces the absurdity of life.', 'Classic'],
      ['The Myth of Sisyphus', 'Albert Camus', 1942, 'An essay about the absurd and the meaning of life.', 'Philosophy'],
      ['The Fall', 'Albert Camus', 1956, 'A novel about a lawyer who confesses his guilt to a stranger.', 'Classic'],
      ['Nausea', 'Jean-Paul Sartre', 1938, 'A novel about a man who experiences existential nausea and alienation.', 'Classic'],
      ['Being and Nothingness', 'Jean-Paul Sartre', 1943, 'A philosophical work about existentialism and consciousness.', 'Philosophy'],
      ['The Little Prince', 'Antoine de Saint-Exupéry', 1943, 'A children\'s book about a young prince who visits various planets.', 'Children'],
      ['The Old Man and the Sea', 'Ernest Hemingway', 1952, 'A novel about an old fisherman\'s struggle with a giant marlin.', 'Classic'],
      ['For Whom the Bell Tolls', 'Ernest Hemingway', 1940, 'A novel about an American fighting in the Spanish Civil War.', 'Historical'],
      ['A Farewell to Arms', 'Ernest Hemingway', 1929, 'A novel about an American ambulance driver in Italy during World War I.', 'Historical'],
      ['The Sun Also Rises', 'Ernest Hemingway', 1926, 'A novel about American expatriates in Paris and Spain after World War I.', 'Classic'],
      ['The Grapes of Wrath', 'John Steinbeck', 1939, 'A novel about a family of tenant farmers during the Great Depression.', 'Historical'],
      ['Of Mice and Men', 'John Steinbeck', 1937, 'A novel about two displaced migrant ranch workers during the Great Depression.', 'Classic'],
      ['East of Eden', 'John Steinbeck', 1952, 'A novel about two families in the Salinas Valley in California.', 'Classic'],
      ['Cannery Row', 'John Steinbeck', 1945, 'A novel about the people who live and work on Cannery Row in Monterey, California.', 'Classic'],
      ['The Pearl', 'John Steinbeck', 1947, 'A novel about a poor pearl diver who finds a valuable pearl.', 'Classic'],
      ['The Red Pony', 'John Steinbeck', 1933, 'A collection of four short stories about a boy and his pony.', 'Children'],
      ['Tortilla Flat', 'John Steinbeck', 1935, 'A novel about a group of paisanos living in Monterey, California.', 'Classic'],
      ['The Winter of Our Discontent', 'John Steinbeck', 1961, 'A novel about a man who struggles with moral choices in a changing America.', 'Classic'],
      ['Travels with Charley', 'John Steinbeck', 1962, 'A travelogue about Steinbeck\'s road trip across America with his dog.', 'Nonfiction'],
      ['The Moon is Down', 'John Steinbeck', 1942, 'A novel about a small town occupied by enemy forces during World War II.', 'Historical'],
      ['The Wayward Bus', 'John Steinbeck', 1947, 'A novel about passengers on a bus that breaks down in California.', 'Classic'],
      ['Sweet Thursday', 'John Steinbeck', 1954, 'A sequel to Cannery Row about the people of Monterey.', 'Classic'],
      ['The Short Reign of Pippin IV', 'John Steinbeck', 1957, 'A satirical novel about a French king who is elected by accident.', 'Satire'],
      ['The Acts of King Arthur and His Noble Knights', 'John Steinbeck', 1976, 'A retelling of the Arthurian legends.', 'Fantasy'],
      ['The Log from the Sea of Cortez', 'John Steinbeck', 1951, 'A travelogue about a marine biology expedition to the Gulf of California.', 'Nonfiction'],
      ['Bombs Away', 'John Steinbeck', 1942, 'A non-fiction book about American bomber crews during World War II.', 'Nonfiction'],
      ['Once There Was a War', 'John Steinbeck', 1958, 'A collection of Steinbeck\'s wartime dispatches.', 'Nonfiction'],
      ['A Russian Journal', 'John Steinbeck', 1948, 'A travelogue about Steinbeck\'s trip to the Soviet Union.', 'Nonfiction'],
      ['The Harvest Gypsies', 'John Steinbeck', 1936, 'A series of articles about migrant workers in California.', 'Nonfiction'],
      ['Their Blood is Strong', 'John Steinbeck', 1938, 'A pamphlet about the plight of migrant workers.', 'Nonfiction'],
      ['The Long Valley', 'John Steinbeck', 1938, 'A collection of short stories set in the Salinas Valley.', 'Classic'],
      ['The Pastures of Heaven', 'John Steinbeck', 1932, 'A novel about the people who live in a beautiful valley in California.', 'Classic'],
      ['To a God Unknown', 'John Steinbeck', 1933, 'A novel about a man who moves to California and becomes obsessed with the land.', 'Classic'],
      ['Cup of Gold', 'John Steinbeck', 1929, 'A novel about the pirate Henry Morgan.', 'Adventure'],
      ['The Murder', 'John Steinbeck', 1934, 'A short story about a man who kills his wife.', 'Mystery'],
      ['Saint Katy the Virgin', 'John Steinbeck', 1936, 'A short story about a pig who becomes a saint.', 'Satire'],
      ['Nothing So Monstrous', 'John Steinbeck', 1936, 'A short story about a man who discovers he can predict the future.', 'Fantasy'],
      ['The Gifts of Iban', 'John Steinbeck', 1936, 'A short story about a man who receives magical gifts.', 'Fantasy'],
      ['The Great Mountains', 'John Steinbeck', 1933, 'A short story about a boy who dreams of climbing the mountains.', 'Children'],
      ['The Leader of the People', 'John Steinbeck', 1936, 'A short story about a grandfather who tells stories of the old west.', 'Historical'],
      ['The Promise', 'John Steinbeck', 1937, 'A short story about a boy who promises to take care of his pony.', 'Children'],
      ['The Gift', 'John Steinbeck', 1933, 'A short story about a boy who receives a pony for Christmas.', 'Children'],
      ['The Harness', 'John Steinbeck', 1938, 'A short story about a man who wears a harness to control his temper.', 'Classic'],
      ['The Vigilante', 'John Steinbeck', 1936, 'A short story about a man who participates in a lynching.', 'Historical'],
      ['Johnny Bear', 'John Steinbeck', 1937, 'A short story about a man who can mimic anyone\'s voice.', 'Classic'],
      ['The Ears of Johnny Bear', 'John Steinbeck', 1936, 'A short story about a man who can hear conversations from far away.', 'Fantasy'],
      ['The Snake', 'John Steinbeck', 1935, 'A short story about a woman who keeps a snake as a pet.', 'Classic'],
      ['The Chrysanthemums', 'John Steinbeck', 1937, 'A short story about a woman who grows chrysanthemums.', 'Classic'],
      ['The White Quail', 'John Steinbeck', 1935, 'A short story about a woman who is obsessed with a white quail.', 'Classic'],
      ['Flight', 'John Steinbeck', 1938, 'A short story about a boy who runs away from home.', 'Adventure'],
      ['The Raid', 'John Steinbeck', 1934, 'A short story about a communist meeting that is raided by the police.', 'Historical'],
      ['The Affair at 7, Rue de M--', 'John Steinbeck', 1934, 'A short story about a man who witnesses a murder.', 'Mystery'],
      ['Breakfast', 'John Steinbeck', 1936, 'A short story about a man who shares breakfast with migrant workers.', 'Classic'],
      ['The Hanging at San Quentin', 'John Steinbeck', 1934, 'A short story about a man who witnesses an execution.', 'Historical'],
      ['The Crapshooter', 'John Steinbeck', 1937, 'A short story about a man who is addicted to gambling.', 'Classic']
    ];
    for (const [title, author, year, description, genre] of popularBooks) {
      const result = insertBook.run(title, author, year, description);
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
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  description?: string;
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
  user_id?: number;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
}

export interface CreateUserData {
  username: string;
  password: string;
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
      const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const result = stmt.run(data.username, hashedPassword);
      
      // Return the created user (without password)
      const user = db.prepare('SELECT id, username, created_at, updated_at FROM users WHERE id = ?').get(result.lastInsertRowid as number) as User;
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
      const stmt = db.prepare('SELECT id, username, created_at, updated_at FROM users WHERE id = ?');
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
    const validSortFields = ['title', 'author', 'year', 'created_at'];
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
        OR EXISTS (
          SELECT 1 FROM book_genres bg 
          JOIN genres g ON bg.genre_id = g.id 
          WHERE bg.book_id = b.id AND g.name LIKE ?
        )
      `;
      searchParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
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
      INSERT INTO books (title, author, year, description, user_id) 
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(data.title, data.author, data.year, data.description, data.user_id);
    
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
  const dbPath = path.join(process.cwd(), 'data', 'books.db');
  const db = new Database(dbPath);
  const books = db.prepare(`
    SELECT b.id, b.title, b.author, b.year, b.description
    FROM books b
    INNER JOIN book_genres bg ON b.id = bg.book_id
    WHERE bg.genre_id = ?
    ORDER BY b.title
  `).all(genreId);
  db.close();
  return books;
}

export default db; 