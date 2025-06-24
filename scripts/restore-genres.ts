import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'books.db');
const db = new Database(dbPath);

console.log('Restoring genre associations...');

try {
  // Start transaction
  db.exec('BEGIN TRANSACTION');

  // Get genre mappings
  const genreMap: Record<string, number> = {};
  const genres = db.prepare('SELECT id, name FROM genres').all() as Array<{ id: number; name: string }>;
  genres.forEach(genre => {
    genreMap[genre.name] = genre.id;
  });

  console.log('Genre mappings:', genreMap);

  // Book data with genres (based on the original sample data)
  const bookGenres: Array<[string, string, string]> = [
    ['The Great Gatsby', 'F. Scott Fitzgerald', 'Classic'],
    ['To Kill a Mockingbird', 'Harper Lee', 'Classic'],
    ['1984', 'George Orwell', 'Dystopian'],
    ['Pride and Prejudice', 'Jane Austen', 'Romance'],
    ['The Catcher in the Rye', 'J.D. Salinger', 'Classic'],
    ['Lord of the Flies', 'William Golding', 'Classic'],
    ['Animal Farm', 'George Orwell', 'Satire'],
    ['The Hobbit', 'J.R.R. Tolkien', 'Fantasy'],
    ['The Lord of the Rings', 'J.R.R. Tolkien', 'Fantasy'],
    ['Jane Eyre', 'Charlotte Brontë', 'Romance'],
    ['Wuthering Heights', 'Emily Brontë', 'Romance'],
    ['Moby-Dick', 'Herman Melville', 'Adventure'],
    ['The Adventures of Huckleberry Finn', 'Mark Twain', 'Adventure'],
    ['The Adventures of Tom Sawyer', 'Mark Twain', 'Adventure'],
    ['Little Women', 'Louisa May Alcott', 'Classic'],
    ['The Scarlet Letter', 'Nathaniel Hawthorne', 'Classic'],
    ['The Picture of Dorian Gray', 'Oscar Wilde', 'Classic'],
    ['Dracula', 'Bram Stoker', 'Horror'],
    ['Frankenstein', 'Mary Shelley', 'Horror'],
    ["Alice's Adventures in Wonderland", 'Lewis Carroll', 'Children'],
    ['Through the Looking-Glass', 'Lewis Carroll', 'Children'],
    ['The Call of the Wild', 'Jack London', 'Adventure'],
    ['White Fang', 'Jack London', 'Adventure'],
    ['The Time Machine', 'H.G. Wells', 'Science Fiction'],
    ['The War of the Worlds', 'H.G. Wells', 'Science Fiction'],
    ['The Invisible Man', 'H.G. Wells', 'Science Fiction'],
    ['The Island of Doctor Moreau', 'H.G. Wells', 'Science Fiction'],
    ['The Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 'Horror'],
    ['Treasure Island', 'Robert Louis Stevenson', 'Adventure'],
    ['Kidnapped', 'Robert Louis Stevenson', 'Adventure'],
    ['The Count of Monte Cristo', 'Alexandre Dumas', 'Adventure'],
    ['The Three Musketeers', 'Alexandre Dumas', 'Adventure'],
    ['Les Misérables', 'Victor Hugo', 'Historical'],
    ['The Hunchback of Notre-Dame', 'Victor Hugo', 'Historical'],
    ['Madame Bovary', 'Gustave Flaubert', 'Classic'],
    ['Anna Karenina', 'Leo Tolstoy', 'Romance'],
    ['War and Peace', 'Leo Tolstoy', 'Historical'],
    ['Crime and Punishment', 'Fyodor Dostoevsky', 'Classic'],
    ['The Brothers Karamazov', 'Fyodor Dostoevsky', 'Classic'],
    ['The Idiot', 'Fyodor Dostoevsky', 'Classic'],
    ['Notes from Underground', 'Fyodor Dostoevsky', 'Classic'],
    ['Don Quixote', 'Miguel de Cervantes', 'Classic'],
    ['The Divine Comedy', 'Dante Alighieri', 'Poetry'],
    ['The Canterbury Tales', 'Geoffrey Chaucer', 'Poetry'],
    ['Paradise Lost', 'John Milton', 'Poetry'],
    ['Robinson Crusoe', 'Daniel Defoe', 'Adventure'],
    ['Gulliver\'s Travels', 'Jonathan Swift', 'Satire'],
    ['Candide', 'Voltaire', 'Satire'],
    ['The Sorrows of Young Werther', 'Johann Wolfgang von Goethe', 'Romance'],
    ['Faust', 'Johann Wolfgang von Goethe', 'Drama'],
    ['The Red and the Black', 'Stendhal', 'Classic'],
    ['The Charterhouse of Parma', 'Stendhal', 'Historical'],
    ['Eugene Onegin', 'Alexander Pushkin', 'Poetry'],
    ['Dead Souls', 'Nikolai Gogol', 'Satire'],
    ['The Overcoat', 'Nikolai Gogol', 'Classic'],
    ['Fathers and Sons', 'Ivan Turgenev', 'Classic'],
    ['A Hero of Our Time', 'Mikhail Lermontov', 'Classic'],
    ['The Master and Margarita', 'Mikhail Bulgakov', 'Fantasy'],
    ['One Hundred Years of Solitude', 'Gabriel García Márquez', 'Fantasy'],
    ['Love in the Time of Cholera', 'Gabriel García Márquez', 'Romance'],
    ['The House of the Spirits', 'Isabel Allende', 'Fantasy'],
    ['Pedro Páramo', 'Juan Rulfo', 'Fantasy'],
    ['The Aleph', 'Jorge Luis Borges', 'Fantasy'],
    ['Ficciones', 'Jorge Luis Borges', 'Fantasy'],
    ['The Labyrinth of Solitude', 'Octavio Paz', 'Nonfiction'],
    ['The Death of Artemio Cruz', 'Carlos Fuentes', 'Historical'],
    ['Hopscotch', 'Julio Cortázar', 'Classic'],
    ['The Tunnel', 'Ernesto Sabato', 'Classic'],
    ['The Plague', 'Albert Camus', 'Classic'],
    ['The Stranger', 'Albert Camus', 'Classic'],
    ['The Myth of Sisyphus', 'Albert Camus', 'Philosophy'],
    ['The Fall', 'Albert Camus', 'Classic'],
    ['Nausea', 'Jean-Paul Sartre', 'Classic'],
    ['Being and Nothingness', 'Jean-Paul Sartre', 'Philosophy'],
    ['The Little Prince', 'Antoine de Saint-Exupéry', 'Children'],
    ['The Old Man and the Sea', 'Ernest Hemingway', 'Classic'],
    ['For Whom the Bell Tolls', 'Ernest Hemingway', 'Historical'],
    ['A Farewell to Arms', 'Ernest Hemingway', 'Historical'],
    ['The Sun Also Rises', 'Ernest Hemingway', 'Classic'],
    ['The Grapes of Wrath', 'John Steinbeck', 'Historical'],
    ['Of Mice and Men', 'John Steinbeck', 'Classic'],
    ['East of Eden', 'John Steinbeck', 'Classic']
  ];

  const insertBookGenre = db.prepare('INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)');
  const getBookId = db.prepare('SELECT id FROM books WHERE title = ? AND author = ?');

  let successCount = 0;
  let errorCount = 0;

  for (const [title, author, genreName] of bookGenres) {
    try {
      const book = getBookId.get(title, author) as { id: number } | undefined;
      const genreId = genreMap[genreName];

      if (book && genreId) {
        insertBookGenre.run(book.id, genreId);
        successCount++;
      } else {
        console.log(`Could not find book: "${title}" by ${author} or genre: ${genreName}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`Error processing "${title}" by ${author}:`, error);
      errorCount++;
    }
  }

  // Commit the transaction
  db.exec('COMMIT');

  console.log(`Genre restoration completed!`);
  console.log(`Successfully restored: ${successCount} genre associations`);
  console.log(`Errors: ${errorCount}`);

} catch (error) {
  // Rollback on error
  db.exec('ROLLBACK');
  console.error('Genre restoration failed:', error);
  throw error;
} finally {
  db.close();
} 