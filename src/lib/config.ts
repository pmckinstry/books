// Database configuration
export const config = {
  // Set this to 'dynamodb', 'firebase', or 'sqlite' to use different databases
  database: process.env.DATABASE_TYPE || 'dynamodb',
  
  // DynamoDB configuration
  dynamodb: {
    enabled: process.env.DATABASE_TYPE === 'dynamodb' || !process.env.DATABASE_TYPE,
    region: process.env.AWS_REGION || 'us-east-1',
    local: process.env.DYNAMODB_LOCAL === 'true'
  },
  
  // Firebase configuration
  firebase: {
    enabled: process.env.DATABASE_TYPE === 'firebase',
    collections: {
      users: 'users',
      books: 'books',
      userBookAssociations: 'user_book_associations',
      genres: 'genres',
      bookGenres: 'book_genres',
      readingLists: 'reading_lists',
      readingListBooks: 'reading_list_books'
    }
  },
  
  // SQLite configuration
  sqlite: {
    enabled: process.env.DATABASE_TYPE === 'sqlite',
    databasePath: process.env.SQLITE_DATABASE_PATH || 'data/books.db'
  }
};

// Helper function to check if DynamoDB is enabled
export const isDynamoDBEnabled = () => config.database === 'dynamodb';

// Helper function to check if Firebase is enabled
export const isFirebaseEnabled = () => config.database === 'firebase';

// Helper function to check if SQLite is enabled
export const isSQLiteEnabled = () => config.database === 'sqlite';
