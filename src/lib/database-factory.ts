import { config } from './config';

// Import all database implementations
import * as SQLiteDB from './database';
import * as DynamoDB from './dynamodb-database';

// Export the appropriate database operations based on configuration
export const userOperations = config.database === 'dynamodb' 
  ? DynamoDB.userOperations 
  : SQLiteDB.userOperations;

export const bookOperations = config.database === 'dynamodb' 
  ? DynamoDB.bookOperations 
  : SQLiteDB.bookOperations;

export const genreOperations = config.database === 'dynamodb' 
  ? DynamoDB.genreOperations 
  : SQLiteDB.genreOperations;

export const readingListOperations = config.database === 'dynamodb' 
  ? DynamoDB.readingListOperations 
  : SQLiteDB.readingListOperations;

export const userBookAssociationOperations = config.database === 'dynamodb' 
  ? DynamoDB.userBookAssociationOperations 
  : SQLiteDB.userBookAssociationOperations;

// Export types from the active database
// For now, export from DynamoDB since that's our primary target
export type {
  User,
  Book,
  Genre,
  BookWithGenres,
  BookFilters,
  UserBookAssociation,
  ReadingList,
  ReadingListWithBooks,
  CreateBookData,
  UpdateBookData,
  CreateUserData,
  LoginData,
  CreateUserBookAssociationData,
  UpdateUserBookAssociationData,
  CreateReadingListData,
  UpdateReadingListData,
  AddBookToListData,
  UpdateBookInListData
} from './dynamodb-database';

// Export the database instance for direct access if needed
export const getDatabase = config.database === 'dynamodb' 
  ? async () => (await import('./dynamodb')).docClient 
  : SQLiteDB.getDatabase;
