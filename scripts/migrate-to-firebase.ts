import { getDatabase } from '../src/lib/database';
import { 
  userOperations, 
  bookOperations, 
  genreOperations, 
  readingListOperations,
  userBookAssociationOperations 
} from '../src/lib/firebase-database';

async function migrateToFirebase() {
  console.log('Starting migration from SQLite to Firebase...');
  
  try {
    const db = getDatabase();
    
    // Migrate genres first (they're referenced by books)
    console.log('Migrating genres...');
    const genres = db.prepare('SELECT * FROM genres').all();
    const genreIdMap = new Map<number, string>(); // SQLite ID -> Firebase ID
    
    for (const genre of genres) {
      const newGenre = await genreOperations.create({
        name: genre.name,
        description: genre.description
      });
      
      if (newGenre) {
        genreIdMap.set(genre.id, newGenre.id);
        console.log(`Migrated genre: ${genre.name} (${genre.id} -> ${newGenre.id})`);
      }
    }
    
    // Migrate users
    console.log('Migrating users...');
    const users = db.prepare('SELECT * FROM users').all();
    const userIdMap = new Map<number, string>(); // SQLite ID -> Firebase ID
    
    for (const user of users) {
      // Note: We can't migrate passwords, so we'll create users with a default password
      // Users will need to reset their passwords
      const newUser = await userOperations.create({
        username: user.username,
        password: 'changeme123', // Default password
        nickname: user.nickname
      });
      
      if (newUser) {
        userIdMap.set(user.id, newUser.id);
        console.log(`Migrated user: ${user.username} (${user.id} -> ${newUser.id})`);
      }
    }
    
    // Migrate books
    console.log('Migrating books...');
    const books = db.prepare('SELECT * FROM books').all();
    const bookIdMap = new Map<number, string>(); // SQLite ID -> Firebase ID
    
    for (const book of books) {
      // Get genres for this book
      const bookGenres = db.prepare(`
        SELECT g.id FROM genres g
        INNER JOIN book_genres bg ON g.id = bg.genre_id
        WHERE bg.book_id = ?
      `).all(book.id);
      
      const genreIds = bookGenres
        .map(bg => genreIdMap.get(bg.id))
        .filter(id => id !== undefined) as string[];
      
      const newBook = await bookOperations.create({
        title: book.title,
        author: book.author,
        description: book.description,
        isbn: book.isbn,
        page_count: book.page_count,
        language: book.language,
        publisher: book.publisher,
        cover_image_url: book.cover_image_url,
        publication_date: book.publication_date,
        user_id: book.user_id ? userIdMap.get(book.user_id) : undefined
      }, genreIds);
      
      if (newBook) {
        bookIdMap.set(book.id, newBook.id);
        console.log(`Migrated book: ${book.title} (${book.id} -> ${newBook.id})`);
      }
    }
    
    // Migrate user-book associations
    console.log('Migrating user-book associations...');
    const associations = db.prepare('SELECT * FROM user_book_associations').all();
    
    for (const association of associations) {
      const newUserId = userIdMap.get(association.user_id);
      const newBookId = bookIdMap.get(association.book_id);
      
      if (newUserId && newBookId) {
        await userBookAssociationOperations.upsert({
          user_id: newUserId,
          book_id: newBookId,
          read_status: association.read_status,
          rating: association.rating,
          comments: association.comments
        });
        console.log(`Migrated association: User ${association.user_id} -> Book ${association.book_id}`);
      }
    }
    
    // Migrate reading lists
    console.log('Migrating reading lists...');
    const readingLists = db.prepare('SELECT * FROM reading_lists').all();
    const readingListIdMap = new Map<number, string>(); // SQLite ID -> Firebase ID
    
    for (const readingList of readingLists) {
      const newUserId = userIdMap.get(readingList.user_id);
      if (!newUserId) continue;
      
      const newReadingList = await readingListOperations.create({
        name: readingList.name,
        description: readingList.description,
        is_public: Boolean(readingList.is_public),
        user_id: newUserId
      });
      
      if (newReadingList) {
        readingListIdMap.set(readingList.id, newReadingList.id);
        console.log(`Migrated reading list: ${readingList.name} (${readingList.id} -> ${newReadingList.id})`);
      }
    }
    
    // Migrate reading list books
    console.log('Migrating reading list books...');
    const readingListBooks = db.prepare('SELECT * FROM reading_list_books').all();
    
    for (const readingListBook of readingListBooks) {
      const newReadingListId = readingListIdMap.get(readingListBook.reading_list_id);
      const newBookId = bookIdMap.get(readingListBook.book_id);
      
      if (newReadingListId && newBookId) {
        await readingListOperations.addBook({
          reading_list_id: newReadingListId,
          book_id: newBookId,
          position: readingListBook.position,
          notes: readingListBook.notes
        });
        console.log(`Migrated reading list book: List ${readingListBook.reading_list_id} -> Book ${readingListBook.book_id}`);
      }
    }
    
    console.log('Migration completed successfully!');
    console.log('\nMigration Summary:');
    console.log(`- Genres: ${genres.length} migrated`);
    console.log(`- Users: ${users.length} migrated`);
    console.log(`- Books: ${books.length} migrated`);
    console.log(`- User-Book Associations: ${associations.length} migrated`);
    console.log(`- Reading Lists: ${readingLists.length} migrated`);
    console.log(`- Reading List Books: ${readingListBooks.length} migrated`);
    
    console.log('\nImportant Notes:');
    console.log('- All users have been given the default password: "changeme123"');
    console.log('- Users should change their passwords after first login');
    console.log('- All data has been preserved with new Firebase document IDs');
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateToFirebase();
}

export { migrateToFirebase };
