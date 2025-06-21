import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

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
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year INTEGER,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data if the table is empty
  const count = db.prepare('SELECT COUNT(*) as count FROM books').get() as { count: number };
  if (count.count === 0) {
    const insertBook = db.prepare(`
      INSERT INTO books (title, author, year, description) 
      VALUES (?, ?, ?, ?)
    `);
    
    const popularBooks = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.'],
      ['To Kill a Mockingbird', 'Harper Lee', 1960, 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.'],
      ['1984', 'George Orwell', 1949, 'A dystopian novel about totalitarianism and surveillance society.'],
      ['Pride and Prejudice', 'Jane Austen', 1813, 'A romantic novel of manners that follows the emotional development of Elizabeth Bennet.'],
      ['The Catcher in the Rye', 'J.D. Salinger', 1951, 'A novel about teenage alienation and loss of innocence in post-World War II America.'],
      ['Lord of the Flies', 'William Golding', 1954, 'A novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.'],
      ['Animal Farm', 'George Orwell', 1945, 'An allegorical novella about a group of farm animals who rebel against their human farmer.'],
      ['The Hobbit', 'J.R.R. Tolkien', 1937, 'A fantasy novel about a hobbit who embarks on a quest to reclaim a dwarf kingdom.'],
      ['The Lord of the Rings', 'J.R.R. Tolkien', 1954, 'An epic high-fantasy novel about the quest to destroy a powerful ring.'],
      ['Jane Eyre', 'Charlotte Brontë', 1847, 'A novel about a young governess who falls in love with her mysterious employer.'],
      ['Wuthering Heights', 'Emily Brontë', 1847, 'A novel about the intense and passionate love between Catherine Earnshaw and Heathcliff.'],
      ['Moby-Dick', 'Herman Melville', 1851, 'A novel about Captain Ahab\'s obsessive quest to kill the white whale Moby Dick.'],
      ['The Adventures of Huckleberry Finn', 'Mark Twain', 1884, 'A novel about a young boy and a runaway slave traveling down the Mississippi River.'],
      ['The Adventures of Tom Sawyer', 'Mark Twain', 1876, 'A novel about a young boy growing up along the Mississippi River.'],
      ['Little Women', 'Louisa May Alcott', 1868, 'A novel about four sisters growing up in America in the mid-1800s.'],
      ['The Scarlet Letter', 'Nathaniel Hawthorne', 1850, 'A novel about a woman who must wear a scarlet letter as punishment for adultery.'],
      ['The Picture of Dorian Gray', 'Oscar Wilde', 1890, 'A novel about a man whose portrait ages while he remains young and beautiful.'],
      ['Dracula', 'Bram Stoker', 1897, 'A novel about Count Dracula\'s attempt to move from Transylvania to England.'],
      ['Frankenstein', 'Mary Shelley', 1818, 'A novel about a scientist who creates a monster and the consequences of his actions.'],
      ['Alice\'s Adventures in Wonderland', 'Lewis Carroll', 1865, 'A novel about a young girl who falls through a rabbit hole into a fantasy world.'],
      ['Through the Looking-Glass', 'Lewis Carroll', 1871, 'A sequel to Alice\'s Adventures in Wonderland about Alice\'s journey through a mirror.'],
      ['The Call of the Wild', 'Jack London', 1903, 'A novel about a dog named Buck who is stolen from his home and sold into service as a sled dog.'],
      ['White Fang', 'Jack London', 1906, 'A novel about a wolf-dog hybrid who learns to survive in the harsh Yukon Territory.'],
      ['The Time Machine', 'H.G. Wells', 1895, 'A science fiction novel about a time traveler who journeys to the distant future.'],
      ['The War of the Worlds', 'H.G. Wells', 1898, 'A science fiction novel about an invasion of Earth by Martians.'],
      ['The Invisible Man', 'H.G. Wells', 1897, 'A science fiction novel about a scientist who discovers how to make himself invisible.'],
      ['The Island of Doctor Moreau', 'H.G. Wells', 1896, 'A science fiction novel about a shipwrecked man who discovers an island where animals are being turned into humans.'],
      ['The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 1886, 'A novel about a doctor who creates a potion that transforms him into a monster.'],
      ['Treasure Island', 'Robert Louis Stevenson', 1883, 'A novel about a young boy who finds a treasure map and sets sail for an island.'],
      ['Kidnapped', 'Robert Louis Stevenson', 1886, 'A novel about a young man who is kidnapped and sold into slavery.'],
      ['The Count of Monte Cristo', 'Alexandre Dumas', 1844, 'A novel about a man who is wrongfully imprisoned and seeks revenge.'],
      ['The Three Musketeers', 'Alexandre Dumas', 1844, 'A novel about a young man who joins the Musketeers of the Guard.'],
      ['Les Misérables', 'Victor Hugo', 1862, 'A novel about the struggles of ex-convict Jean Valjean and his quest for redemption.'],
      ['The Hunchback of Notre-Dame', 'Victor Hugo', 1831, 'A novel about a deformed bell-ringer who falls in love with a beautiful gypsy.'],
      ['Madame Bovary', 'Gustave Flaubert', 1857, 'A novel about a woman who seeks escape from the banalities and emptiness of provincial life.'],
      ['Anna Karenina', 'Leo Tolstoy', 1877, 'A novel about the tragic love affair between Anna Karenina and Count Vronsky.'],
      ['War and Peace', 'Leo Tolstoy', 1869, 'A novel about Russian society during the Napoleonic era.'],
      ['Crime and Punishment', 'Fyodor Dostoevsky', 1866, 'A novel about a young man who commits murder and the psychological consequences.'],
      ['The Brothers Karamazov', 'Fyodor Dostoevsky', 1880, 'A novel about the murder of a father and the impact on his sons.'],
      ['The Idiot', 'Fyodor Dostoevsky', 1869, 'A novel about a young man who is considered an idiot but possesses great moral purity.'],
      ['Notes from Underground', 'Fyodor Dostoevsky', 1864, 'A novel about a bitter, isolated man who lives in St. Petersburg.'],
      ['Don Quixote', 'Miguel de Cervantes', 1605, 'A novel about a man who reads too many chivalric romances and decides to become a knight.'],
      ['The Divine Comedy', 'Dante Alighieri', 1320, 'An epic poem about the author\'s journey through Hell, Purgatory, and Paradise.'],
      ['The Canterbury Tales', 'Geoffrey Chaucer', 1400, 'A collection of stories told by pilgrims on their way to Canterbury.'],
      ['Paradise Lost', 'John Milton', 1667, 'An epic poem about the fall of man and the rebellion of Satan.'],
      ['Robinson Crusoe', 'Daniel Defoe', 1719, 'A novel about a man who is shipwrecked on a desert island for 28 years.'],
      ['Gulliver\'s Travels', 'Jonathan Swift', 1726, 'A satirical novel about a man who travels to various fantastical lands.'],
      ['Candide', 'Voltaire', 1759, 'A satirical novel about a young man who is taught that everything is for the best.'],
      ['The Sorrows of Young Werther', 'Johann Wolfgang von Goethe', 1774, 'A novel about a young artist who falls in love with a woman already engaged.'],
      ['Faust', 'Johann Wolfgang von Goethe', 1808, 'A tragic play about a scholar who makes a pact with the devil.'],
      ['The Sorrows of Young Werther', 'Johann Wolfgang von Goethe', 1774, 'A novel about a young artist who falls in love with a woman already engaged.'],
      ['The Red and the Black', 'Stendhal', 1830, 'A novel about a young man who tries to rise above his station in life.'],
      ['The Charterhouse of Parma', 'Stendhal', 1839, 'A novel about a young Italian nobleman during the Napoleonic era.'],
      ['Eugene Onegin', 'Alexander Pushkin', 1833, 'A novel in verse about a young man who rejects a woman\'s love and later regrets it.'],
      ['Dead Souls', 'Nikolai Gogol', 1842, 'A novel about a man who buys dead serfs to improve his social standing.'],
      ['The Overcoat', 'Nikolai Gogol', 1842, 'A short story about a poor government clerk who saves money to buy a new overcoat.'],
      ['Fathers and Sons', 'Ivan Turgenev', 1862, 'A novel about the conflict between generations in 19th-century Russia.'],
      ['A Hero of Our Time', 'Mikhail Lermontov', 1840, 'A novel about a bored and cynical young officer in the Russian army.'],
      ['The Master and Margarita', 'Mikhail Bulgakov', 1967, 'A novel about the devil visiting Moscow and the story of Pontius Pilate.'],
      ['One Hundred Years of Solitude', 'Gabriel García Márquez', 1967, 'A novel about the Buendía family over seven generations.'],
      ['Love in the Time of Cholera', 'Gabriel García Márquez', 1985, 'A novel about a love triangle spanning fifty years.'],
      ['The House of the Spirits', 'Isabel Allende', 1982, 'A novel about the Trueba family over four generations in Chile.'],
      ['Pedro Páramo', 'Juan Rulfo', 1955, 'A novel about a man who visits his father\'s hometown and finds it inhabited by ghosts.'],
      ['The Aleph', 'Jorge Luis Borges', 1949, 'A collection of short stories exploring themes of infinity and reality.'],
      ['Ficciones', 'Jorge Luis Borges', 1944, 'A collection of short stories that blend fantasy and reality.'],
      ['The Labyrinth of Solitude', 'Octavio Paz', 1950, 'An essay about Mexican identity and culture.'],
      ['The Death of Artemio Cruz', 'Carlos Fuentes', 1962, 'A novel about a dying man reflecting on his life during the Mexican Revolution.'],
      ['Hopscotch', 'Julio Cortázar', 1963, 'A novel that can be read in multiple orders, exploring themes of chance and choice.'],
      ['The Tunnel', 'Ernesto Sabato', 1948, 'A novel about an artist who becomes obsessed with a woman he sees at an exhibition.'],
      ['The Plague', 'Albert Camus', 1947, 'A novel about a plague that strikes the Algerian city of Oran.'],
      ['The Stranger', 'Albert Camus', 1942, 'A novel about a man who kills an Arab and faces the absurdity of life.'],
      ['The Myth of Sisyphus', 'Albert Camus', 1942, 'An essay about the absurd and the meaning of life.'],
      ['The Fall', 'Albert Camus', 1956, 'A novel about a lawyer who confesses his guilt to a stranger.'],
      ['Nausea', 'Jean-Paul Sartre', 1938, 'A novel about a man who experiences existential nausea and alienation.'],
      ['Being and Nothingness', 'Jean-Paul Sartre', 1943, 'A philosophical work about existentialism and consciousness.'],
      ['The Little Prince', 'Antoine de Saint-Exupéry', 1943, 'A children\'s book about a young prince who visits various planets.'],
      ['The Stranger', 'Albert Camus', 1942, 'A novel about a man who kills an Arab and faces the absurdity of life.'],
      ['The Plague', 'Albert Camus', 1947, 'A novel about a plague that strikes the Algerian city of Oran.'],
      ['The Fall', 'Albert Camus', 1956, 'A novel about a lawyer who confesses his guilt to a stranger.'],
      ['The Myth of Sisyphus', 'Albert Camus', 1942, 'An essay about the absurd and the meaning of life.'],
      ['Nausea', 'Jean-Paul Sartre', 1938, 'A novel about a man who experiences existential nausea and alienation.'],
      ['Being and Nothingness', 'Jean-Paul Sartre', 1943, 'A philosophical work about existentialism and consciousness.'],
      ['The Little Prince', 'Antoine de Saint-Exupéry', 1943, 'A children\'s book about a young prince who visits various planets.'],
      ['The Old Man and the Sea', 'Ernest Hemingway', 1952, 'A novel about an old fisherman\'s struggle with a giant marlin.'],
      ['For Whom the Bell Tolls', 'Ernest Hemingway', 1940, 'A novel about an American fighting in the Spanish Civil War.'],
      ['A Farewell to Arms', 'Ernest Hemingway', 1929, 'A novel about an American ambulance driver in Italy during World War I.'],
      ['The Sun Also Rises', 'Ernest Hemingway', 1926, 'A novel about American expatriates in Paris and Spain after World War I.'],
      ['The Grapes of Wrath', 'John Steinbeck', 1939, 'A novel about a family of tenant farmers during the Great Depression.'],
      ['Of Mice and Men', 'John Steinbeck', 1937, 'A novel about two displaced migrant ranch workers during the Great Depression.'],
      ['East of Eden', 'John Steinbeck', 1952, 'A novel about two families in the Salinas Valley in California.'],
      ['Cannery Row', 'John Steinbeck', 1945, 'A novel about the people who live and work on Cannery Row in Monterey, California.'],
      ['The Pearl', 'John Steinbeck', 1947, 'A novel about a poor pearl diver who finds a valuable pearl.'],
      ['The Red Pony', 'John Steinbeck', 1933, 'A collection of four short stories about a boy and his pony.'],
      ['Tortilla Flat', 'John Steinbeck', 1935, 'A novel about a group of paisanos living in Monterey, California.'],
      ['The Winter of Our Discontent', 'John Steinbeck', 1961, 'A novel about a man who struggles with moral choices in a changing America.'],
      ['Travels with Charley', 'John Steinbeck', 1962, 'A travelogue about Steinbeck\'s road trip across America with his dog.'],
      ['The Moon is Down', 'John Steinbeck', 1942, 'A novel about a small town occupied by enemy forces during World War II.'],
      ['The Wayward Bus', 'John Steinbeck', 1947, 'A novel about passengers on a bus that breaks down in California.'],
      ['Sweet Thursday', 'John Steinbeck', 1954, 'A sequel to Cannery Row about the people of Monterey.'],
      ['The Short Reign of Pippin IV', 'John Steinbeck', 1957, 'A satirical novel about a French king who is elected by accident.'],
      ['The Acts of King Arthur and His Noble Knights', 'John Steinbeck', 1976, 'A retelling of the Arthurian legends.'],
      ['The Log from the Sea of Cortez', 'John Steinbeck', 1951, 'A travelogue about a marine biology expedition to the Gulf of California.'],
      ['Bombs Away', 'John Steinbeck', 1942, 'A non-fiction book about American bomber crews during World War II.'],
      ['Once There Was a War', 'John Steinbeck', 1958, 'A collection of Steinbeck\'s wartime dispatches.'],
      ['A Russian Journal', 'John Steinbeck', 1948, 'A travelogue about Steinbeck\'s trip to the Soviet Union.'],
      ['The Harvest Gypsies', 'John Steinbeck', 1936, 'A series of articles about migrant workers in California.'],
      ['Their Blood is Strong', 'John Steinbeck', 1938, 'A pamphlet about the plight of migrant workers.'],
      ['The Long Valley', 'John Steinbeck', 1938, 'A collection of short stories set in the Salinas Valley.'],
      ['The Pastures of Heaven', 'John Steinbeck', 1932, 'A novel about the people who live in a beautiful valley in California.'],
      ['To a God Unknown', 'John Steinbeck', 1933, 'A novel about a man who moves to California and becomes obsessed with the land.'],
      ['Cup of Gold', 'John Steinbeck', 1929, 'A novel about the pirate Henry Morgan.'],
      ['The Murder', 'John Steinbeck', 1934, 'A short story about a man who kills his wife.'],
      ['Saint Katy the Virgin', 'John Steinbeck', 1936, 'A short story about a pig who becomes a saint.'],
      ['Nothing So Monstrous', 'John Steinbeck', 1936, 'A short story about a man who discovers he can predict the future.'],
      ['The Gifts of Iban', 'John Steinbeck', 1936, 'A short story about a man who receives magical gifts.'],
      ['The Great Mountains', 'John Steinbeck', 1933, 'A short story about a boy who dreams of climbing the mountains.'],
      ['The Leader of the People', 'John Steinbeck', 1936, 'A short story about a grandfather who tells stories of the old west.'],
      ['The Promise', 'John Steinbeck', 1937, 'A short story about a boy who promises to take care of his pony.'],
      ['The Gift', 'John Steinbeck', 1933, 'A short story about a boy who receives a pony for Christmas.'],
      ['The Harness', 'John Steinbeck', 1938, 'A short story about a man who wears a harness to control his temper.'],
      ['The Vigilante', 'John Steinbeck', 1936, 'A short story about a man who participates in a lynching.'],
      ['Johnny Bear', 'John Steinbeck', 1937, 'A short story about a man who can mimic anyone\'s voice.'],
      ['The Ears of Johnny Bear', 'John Steinbeck', 1936, 'A short story about a man who can hear conversations from far away.'],
      ['The Snake', 'John Steinbeck', 1935, 'A short story about a woman who keeps a snake as a pet.'],
      ['The Chrysanthemums', 'John Steinbeck', 1937, 'A short story about a woman who grows chrysanthemums.'],
      ['The White Quail', 'John Steinbeck', 1935, 'A short story about a woman who is obsessed with a white quail.'],
      ['Flight', 'John Steinbeck', 1938, 'A short story about a boy who runs away from home.'],
      ['The Raid', 'John Steinbeck', 1934, 'A short story about a communist meeting that is raided by the police.'],
      ['The Affair at 7, Rue de M--', 'John Steinbeck', 1934, 'A short story about a man who witnesses a murder.'],
      ['Breakfast', 'John Steinbeck', 1936, 'A short story about a man who shares breakfast with migrant workers.'],
      ['The Hanging at San Quentin', 'John Steinbeck', 1934, 'A short story about a man who witnesses an execution.'],
      ['The Crapshooter', 'John Steinbeck', 1937, 'A short story about a man who is addicted to gambling.'],
      ['The Affair at 7, Rue de M--', 'John Steinbeck', 1934, 'A short story about a man who witnesses a murder.'],
      ['Breakfast', 'John Steinbeck', 1936, 'A short story about a man who shares breakfast with migrant workers.'],
      ['The Hanging at San Quentin', 'John Steinbeck', 1934, 'A short story about a man who witnesses an execution.'],
      ['The Crapshooter', 'John Steinbeck', 1937, 'A short story about a man who is addicted to gambling.']
    ];
    
    popularBooks.forEach(book => insertBook.run(book));
  }
}

// Initialize the database
initializeDatabase();

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  year: number;
  description?: string;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
}

// Book CRUD operations
export const bookOperations = {
  // Get all books
  getAll: (): Book[] => {
    const stmt = db.prepare('SELECT * FROM books ORDER BY created_at DESC');
    return stmt.all() as Book[];
  },

  // Get a single book by ID
  getById: (id: number): Book | null => {
    const stmt = db.prepare('SELECT * FROM books WHERE id = ?');
    const book = stmt.get(id) as Book | undefined;
    return book || null;
  },

  // Create a new book
  create: (data: CreateBookData): Book => {
    const stmt = db.prepare(`
      INSERT INTO books (title, author, year, description) 
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(data.title, data.author, data.year, data.description);
    
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

export default db; 