import { config } from './config';

// Import all database implementations
import * as SQLiteDB from './database';
import * as FirebaseDB from './firebase-database';
import * as DynamoDB from './dynamodb-database';

// Export the appropriate database operations based on configuration
export const userOperations = config.database === 'dynamodb' 
  ? DynamoDB.userOperations 
  : config.database === 'firebase'
  ? FirebaseDB.userOperations
  : SQLiteDB.userOperations;

export const bookOperations = config.database === 'dynamodb' 
  ? DynamoDB.bookOperations 
  : config.database === 'firebase'
  ? FirebaseDB.bookOperations
  : SQLiteDB.bookOperations;

export const genreOperations = config.database === 'dynamodb' 
  ? DynamoDB.genreOperations 
  : config.database === 'firebase'
  ? FirebaseDB.genreOperations
  : SQLiteDB.genreOperations;

export const readingListOperations = config.database === 'dynamodb' 
  ? DynamoDB.readingListOperations 
  : config.database === 'firebase'
  ? FirebaseDB.readingListOperations
  : SQLiteDB.readingListOperations;

export const userBookAssociationOperations = config.database === 'dynamodb' 
  ? DynamoDB.userBookAssociationOperations 
  : config.database === 'firebase'
  ? FirebaseDB.userBookAssociationOperations
  : SQLiteDB.userBookAssociationOperations;

// Export types from the active database
// For now, export from DynamoDB since that's our primary target
export type {
  User,
  Book,
  Genre,
  BookWithGenres,
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
  ? () => require('./dynamodb').docClient 
  : SQLiteDB.getDatabase;
