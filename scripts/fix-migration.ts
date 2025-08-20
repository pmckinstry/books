import * as dotenv from 'dotenv';
import * as path from 'path';
import { getDatabase } from '../src/lib/database';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create working DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function fixMigration() {
  console.log('Starting fixed migration from SQLite to DynamoDB...');
  
  try {
    const db = getDatabase();
    
    // Migrate genres first
    console.log('Migrating genres...');
    const genres = db.prepare('SELECT * FROM genres').all();
    const genreIdMap = new Map<number, string>();
    
    for (const genre of genres) {
      const genreId = uuidv4();
      genreIdMap.set(genre.id, genreId);
      
      await docClient.send(new PutCommand({
        TableName: 'genres',
        Item: {
          id: genreId,
          name: genre.name,
          description: genre.description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));
      
      console.log(`Migrated genre: ${genre.name} (${genre.id} -> ${genreId})`);
    }
    
    // Migrate users
    console.log('Migrating users...');
    const users = db.prepare('SELECT * FROM users').all();
    const userIdMap = new Map<number, string>();
    
    for (const user of users) {
      const userId = uuidv4();
      userIdMap.set(user.id, userId);
      
      // Store user data
      await docClient.send(new PutCommand({
        TableName: 'users',
        Item: {
          id: userId,
          username: user.username,
          nickname: user.nickname || user.username,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));
      
      // Store password separately
      const hashedPassword = bcrypt.hashSync('changeme123', 10);
      await docClient.send(new PutCommand({
        TableName: 'users',
        Item: {
          id: `${userId}#password`,
          password: hashedPassword
        }
      }));
      
      console.log(`Migrated user: ${user.username} (${user.id} -> ${userId})`);
    }
    
    // Migrate books
    console.log('Migrating books...');
    const books = db.prepare('SELECT * FROM books').all();
    const bookIdMap = new Map<number, string>();
    
    for (const book of books) {
      const bookId = uuidv4();
      bookIdMap.set(book.id, bookId);
      
      await docClient.send(new PutCommand({
        TableName: 'books',
        Item: {
          id: bookId,
          title: book.title,
          author: book.author,
          description: book.description,
          isbn: book.isbn,
          page_count: book.page_count,
          language: book.language,
          publisher: book.publisher,
          cover_image_url: book.cover_image_url,
          publication_date: book.publication_date,
          user_id: book.user_id ? userIdMap.get(book.user_id) : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));
      
      console.log(`Migrated book: ${book.title} (${book.id} -> ${bookId})`);
    }
    
    // Migrate user-book associations
    console.log('Migrating user-book associations...');
    const associations = db.prepare('SELECT * FROM user_book_associations').all();
    
    for (const association of associations) {
      const newUserId = userIdMap.get(association.user_id);
      const newBookId = bookIdMap.get(association.book_id);
      
      if (newUserId && newBookId) {
        await docClient.send(new PutCommand({
          TableName: 'user_book_associations',
          Item: {
            user_id: newUserId,
            book_id: newBookId,
            read_status: association.read_status,
            rating: association.rating,
            comments: association.comments,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }));
        console.log(`Migrated association: User ${association.user_id} -> Book ${association.book_id}`);
      }
    }
    
    // Migrate reading lists
    console.log('Migrating reading lists...');
    const readingLists = db.prepare('SELECT * FROM reading_lists').all();
    const readingListIdMap = new Map<number, string>();
    
    for (const readingList of readingLists) {
      const listId = uuidv4();
      readingListIdMap.set(readingList.id, listId);
      
      const newUserId = userIdMap.get(readingList.user_id);
      if (!newUserId) continue;
      
      await docClient.send(new PutCommand({
        TableName: 'reading_lists',
        Item: {
          id: listId,
          name: readingList.name,
          description: readingList.description,
          is_public: Boolean(readingList.is_public),
          user_id: newUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }));
      
      console.log(`Migrated reading list: ${readingList.name} (${readingList.id} -> ${listId})`);
    }
    
    // Migrate reading list books
    console.log('Migrating reading list books...');
    const readingListBooks = db.prepare('SELECT * FROM reading_list_books').all();
    
    for (const readingListBook of readingListBooks) {
      const newReadingListId = readingListIdMap.get(readingListBook.reading_list_id);
      const newBookId = bookIdMap.get(readingListBook.book_id);
      
      if (newReadingListId && newBookId) {
        await docClient.send(new PutCommand({
          TableName: 'reading_list_books',
          Item: {
            reading_list_id: newReadingListId,
            book_id: newBookId,
            position: readingListBook.position,
            notes: readingListBook.notes,
            added_at: new Date().toISOString()
          }
        }));
        console.log(`Migrated reading list book: List ${readingListBook.reading_list_id} -> Book ${readingListBook.book_id}`);
      }
    }
    
    console.log('\n🎉 Fixed migration completed successfully!');
    console.log('\nMigration Summary:');
    console.log(`- Genres: ${genres.length} migrated`);
    console.log(`- Users: ${users.length} migrated`);
    console.log(`- Books: ${books.length} migrated`);
    console.log(`- User-Book Associations: ${associations.length} migrated`);
    console.log(`- Reading Lists: ${readingLists.length} migrated`);
    console.log(`- Reading List Books: ${readingListBooks.length} migrated`);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  fixMigration();
}

export { fixMigration };
