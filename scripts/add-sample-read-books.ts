import Database from 'better-sqlite3';
import path from 'path';

function addSampleReadBooks() {
  const dbPath = path.join(process.cwd(), 'data', 'books.db');
  const db = new Database(dbPath);

  try {
    // Get some book IDs to mark as read
    const books = db.prepare('SELECT id FROM books LIMIT 15').all() as { id: number }[];
    
    // Insert sample read books for multiple users
    const insertAssociation = db.prepare(`
      INSERT OR REPLACE INTO user_book_associations 
      (user_id, book_id, read_status, rating, comments) 
      VALUES (?, ?, ?, ?, ?)
    `);

    // Sample read books for user ID 1 (admin)
    const user1ReadBooks = [
      { bookId: books[0]?.id, rating: 5, comments: 'Absolutely brilliant! One of my all-time favorites.' },
      { bookId: books[1]?.id, rating: 4, comments: 'Great classic, really enjoyed the story.' },
      { bookId: books[2]?.id, rating: 3, comments: 'Interesting but a bit heavy.' },
      { bookId: books[3]?.id, rating: 5, comments: 'Beautiful romance, timeless story.' },
      { bookId: books[4]?.id, rating: 4, comments: 'Captures teenage angst perfectly.' }
    ];

    // Sample read books for user ID 2 (if exists)
    const user2ReadBooks = [
      { bookId: books[5]?.id, rating: 4, comments: 'Powerful allegory about society.' },
      { bookId: books[6]?.id, rating: 5, comments: 'Epic fantasy adventure!' },
      { bookId: books[7]?.id, rating: 3, comments: 'Gothic romance with a twist.' },
      { bookId: books[8]?.id, rating: 4, comments: 'Classic horror, very atmospheric.' },
      { bookId: books[9]?.id, rating: 5, comments: 'Magical and whimsical, loved it!' }
    ];

    // Sample read books for user ID 3 (if exists)
    const user3ReadBooks = [
      { bookId: books[10]?.id, rating: 4, comments: 'Thought-provoking dystopian novel.' },
      { bookId: books[11]?.id, rating: 5, comments: 'Masterpiece of Russian literature.' },
      { bookId: books[12]?.id, rating: 3, comments: 'Complex but rewarding read.' },
      { bookId: books[13]?.id, rating: 4, comments: 'Beautiful prose and deep themes.' },
      { bookId: books[14]?.id, rating: 5, comments: 'Incredible world-building and characters.' }
    ];

    // Add read books for user 1
    let addedCount = 0;
    for (const { bookId, rating, comments } of user1ReadBooks) {
      if (bookId) {
        insertAssociation.run(1, bookId, 'read', rating, comments);
        addedCount++;
      }
    }

    // Add read books for user 2 (if user exists)
    const user2Exists = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = 2').get() as { count: number };
    if (user2Exists.count > 0) {
      for (const { bookId, rating, comments } of user2ReadBooks) {
        if (bookId) {
          insertAssociation.run(2, bookId, 'read', rating, comments);
          addedCount++;
        }
      }
    }

    // Add read books for user 3 (if user exists)
    const user3Exists = db.prepare('SELECT COUNT(*) as count FROM users WHERE id = 3').get() as { count: number };
    if (user3Exists.count > 0) {
      for (const { bookId, rating, comments } of user3ReadBooks) {
        if (bookId) {
          insertAssociation.run(3, bookId, 'read', rating, comments);
          addedCount++;
        }
      }
    }

    console.log(`Successfully marked ${addedCount} books as read across users`);
    
    // Show the read books for each user
    const users = db.prepare('SELECT id, username, nickname FROM users ORDER BY id').all() as any[];
    
    for (const user of users) {
      const readBooks = db.prepare(`
        SELECT b.title, b.author, uba.rating, uba.comments
        FROM books b
        INNER JOIN user_book_associations uba ON b.id = uba.book_id
        WHERE uba.user_id = ? AND uba.read_status = 'read'
        ORDER BY b.title
      `).all(user.id);
      
      if (readBooks.length > 0) {
        console.log(`\nRead books for ${user.nickname || user.username} (ID: ${user.id}):`);
        readBooks.forEach((book: any) => {
          console.log(`- ${book.title} by ${book.author} (${book.rating}/5 stars)`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error adding sample read books:', error);
  } finally {
    db.close();
  }
}

addSampleReadBooks(); 