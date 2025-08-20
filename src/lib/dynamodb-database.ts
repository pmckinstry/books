import { 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand,
  BatchWriteCommand
} from '@aws-sdk/lib-dynamodb';
import { docClient, TABLES } from './dynamodb';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Type definitions (keeping the same interface for compatibility)
export interface User {
  id: string;
  username: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface UserBookAssociation {
  id: string;
  user_id: string;
  book_id: string;
  read_status: 'unread' | 'reading' | 'read';
  rating?: number;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookData {
  title: string;
  author: string;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  user_id?: string;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  genres?: string[];
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
  user_id: string;
  book_id: string;
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
  id: string;
  name: string;
  description?: string;
}

export interface BookWithGenres extends Book {
  genres: Genre[];
}

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ReadingListBook {
  id: string;
  reading_list_id: string;
  book_id: string;
  position: number;
  notes?: string;
  added_at: string;
}

export interface ReadingListWithBooks extends ReadingList {
  books: (BookWithGenres & { reading_list_book: ReadingListBook })[];
  book_count: number;
}

export interface CreateReadingListData {
  name: string;
  description?: string;
  is_public?: boolean;
  user_id: string;
}

export interface UpdateReadingListData {
  name?: string;
  description?: string;
  is_public?: boolean;
}

export interface AddBookToListData {
  reading_list_id: string;
  book_id: string;
  position?: number;
  notes?: string;
}

export interface UpdateBookInListData {
  position?: number;
  notes?: string;
}

// Helper function to generate UUID
const generateId = (): string => uuidv4();

// Helper function to get current timestamp
const getCurrentTimestamp = (): string => new Date().toISOString();

// User operations
export const userOperations = {
  // Create a new user
  create: async (data: CreateUserData): Promise<User | null> => {
    try {
      const hashedPassword = bcrypt.hashSync(data.password, 10);
      const userId = generateId();
      const now = getCurrentTimestamp();
      
      const userData: User = {
        id: userId,
        username: data.username,
        nickname: data.nickname || data.username,
        created_at: now,
        updated_at: now
      };
      
      // Store user data (without password in main record)
      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: userData
      }));
      
      // Store password separately for security
      await docClient.send(new PutCommand({
        TableName: TABLES.USERS,
        Item: {
          id: `${userId}#password`,
          password: hashedPassword
        }
      }));
      
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  // Authenticate user
  authenticate: async (data: LoginData): Promise<User | null> => {
    try {
      // Query by username using GSI
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': data.username
        }
      }));
      
      if (!result.Items || result.Items.length === 0) return null;
      
      const user = result.Items[0] as User;
      
      // Get password
      const passwordResult = await docClient.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { id: `${user.id}#password` }
      }));
      
      if (!passwordResult.Item) return null;
      
      const isValid = bcrypt.compareSync(data.password, passwordResult.Item.password);
      if (!isValid) return null;
      
      return user;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { id }
      }));
      
      return result.Item as User || null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Check if username exists
  usernameExists: async (username: string): Promise<boolean> => {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.USERS,
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': username
        }
      }));
      
      return result.Items && result.Items.length > 0;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  },

  // Update user profile
  updateProfile: async (userId: string, data: { nickname?: string }): Promise<User | null> => {
    try {
      const updates: any = {};
      const expressionAttributeNames: any = {};
      const expressionAttributeValues: any = {};
      
      if (data.nickname !== undefined) {
        updates['#nickname'] = data.nickname;
        expressionAttributeNames['#nickname'] = 'nickname';
        expressionAttributeValues[':nickname'] = data.nickname;
      }
      
      if (Object.keys(updates).length === 0) {
        return userOperations.getById(userId);
      }
      
      updates['#updated_at'] = getCurrentTimestamp();
      expressionAttributeNames['#updated_at'] = 'updated_at';
      expressionAttributeValues[':updated_at'] = getCurrentTimestamp();
      
      await docClient.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { id: userId },
        UpdateExpression: `SET ${Object.keys(updates).map(key => `${key} = :${key.slice(1)}`).join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));
      
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
  upsert: async (data: CreateUserBookAssociationData): Promise<UserBookAssociation | null> => {
    try {
      const now = getCurrentTimestamp();
      
      const associationData: UserBookAssociation = {
        id: generateId(),
        user_id: data.user_id,
        book_id: data.book_id,
        read_status: data.read_status || 'unread',
        rating: data.rating || null,
        comments: data.comments || null,
        created_at: now,
        updated_at: now
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.USER_BOOK_ASSOCIATIONS,
        Item: associationData
      }));
      
      return associationData;
    } catch (error) {
      console.error('Error upserting user-book association:', error);
      return null;
    }
  },

  // Get association by user and book
  getByUserAndBook: async (userId: string, bookId: string): Promise<UserBookAssociation | null> => {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.USER_BOOK_ASSOCIATIONS,
        Key: {
          user_id: userId,
          book_id: bookId
        }
      }));
      
      return result.Item as UserBookAssociation || null;
    } catch (error) {
      console.error('Error getting user-book association:', error);
      return null;
    }
  },

  // Get all associations for a user
  getByUser: async (userId: string): Promise<UserBookAssociation[]> => {
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: TABLES.USER_BOOK_ASSOCIATIONS,
        KeyConditionExpression: 'user_id = :user_id',
        ExpressionAttributeValues: {
          ':user_id': userId
        }
      }));
      
      return (result.Items || []) as UserBookAssociation[];
    } catch (error) {
      console.error('Error getting user associations:', error);
      return [];
    }
  },

  // Update an existing association
  update: async (userId: string, bookId: string, data: UpdateUserBookAssociationData): Promise<UserBookAssociation | null> => {
    try {
      const updates: any = {};
      const expressionAttributeNames: any = {};
      const expressionAttributeValues: any = {};
      
      if (data.read_status !== undefined) {
        updates['#read_status'] = data.read_status;
        expressionAttributeNames['#read_status'] = 'read_status';
        expressionAttributeValues[':read_status'] = data.read_status;
      }
      if (data.rating !== undefined) {
        updates['#rating'] = data.rating;
        expressionAttributeNames['#rating'] = 'rating';
        expressionAttributeValues[':rating'] = data.rating;
      }
      if (data.comments !== undefined) {
        updates['#comments'] = data.comments;
        expressionAttributeNames['#comments'] = 'comments';
        expressionAttributeValues[':comments'] = data.comments;
      }
      
      if (Object.keys(updates).length === 0) {
        return userBookAssociationOperations.getByUserAndBook(userId, bookId);
      }
      
      updates['#updated_at'] = getCurrentTimestamp();
      expressionAttributeNames['#updated_at'] = 'updated_at';
      expressionAttributeValues[':updated_at'] = getCurrentTimestamp();
      
      await docClient.send(new UpdateCommand({
        TableName: TABLES.USER_BOOK_ASSOCIATIONS,
        Key: {
          user_id: userId,
          book_id: bookId
        },
        UpdateExpression: `SET ${Object.keys(updates).map(key => `${key} = :${key.slice(1)}`).join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      }));
      
      return userBookAssociationOperations.getByUserAndBook(userId, bookId);
    } catch (error) {
      console.error('Error updating user-book association:', error);
      return null;
    }
  },

  // Delete an association
  delete: async (userId: string, bookId: string): Promise<boolean> => {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.USER_BOOK_ASSOCIATIONS,
        Key: {
          user_id: userId,
          book_id: bookId
        }
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting user-book association:', error);
      return false;
    }
  }
};

// Book operations
export const bookOperations = {
  // Create a new book
  create: async (data: CreateBookData, genres?: string[]): Promise<BookWithGenres | null> => {
    try {
      const bookId = generateId();
      const now = getCurrentTimestamp();
      
      const bookData: Book = {
        id: bookId,
        ...data,
        created_at: now,
        updated_at: now
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.BOOKS,
        Item: bookData
      }));
      
      // Add genres if provided
      if (genres && genres.length > 0) {
        await bookOperations.setGenres(bookId, genres);
      }
      
      return bookOperations.getById(bookId);
    } catch (error) {
      console.error('Error creating book:', error);
      return null;
    }
  },

  // Get a single book by ID
  getById: async (id: string): Promise<BookWithGenres | null> => {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.BOOKS,
        Key: { id }
      }));
      
      if (!result.Item) return null;
      
      const book = result.Item as Book;
      const genres = await bookOperations.getGenresForBook(id);
      
      return { ...book, genres };
    } catch (error) {
      console.error('Error getting book by ID:', error);
      return null;
    }
  },

  // Get all books
  getAll: async (): Promise<BookWithGenres[]> => {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.BOOKS
      }));
      
      const books = (result.Items || []) as Book[];
      
      // Get genres for each book
      const booksWithGenres = await Promise.all(
        books.map(async (book) => {
          const genres = await bookOperations.getGenresForBook(book.id);
          return { ...book, genres };
        })
      );
      
      return booksWithGenres.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting all books:', error);
      return [];
    }
  },

  // Get paginated books
  getPaginated: async (
    page: number = 1, 
    limit: number = 10, 
    sortBy: string = 'created_at', 
    sortOrder: 'asc' | 'desc' = 'desc', 
    search?: string
  ): Promise<{ books: BookWithGenres[], total: number, totalPages: number }> => {
    try {
      // For simplicity, get all books and paginate in memory
      // In production, you'd use DynamoDB's pagination features
      const allBooks = await bookOperations.getAll();
      
      let filteredBooks = allBooks;
      
      // Apply search filter
      if (search && search.trim()) {
        const searchTerm = search.toLowerCase();
        filteredBooks = allBooks.filter(book => 
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          (book.description && book.description.toLowerCase().includes(searchTerm)) ||
          (book.isbn && book.isbn.toLowerCase().includes(searchTerm))
        );
      }
      
      // Apply sorting
      filteredBooks.sort((a, b) => {
        const aValue = a[sortBy as keyof Book];
        const bValue = b[sortBy as keyof Book];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortOrder === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        return 0;
      });
      
      // Apply pagination
      const total = filteredBooks.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
      
      const totalPages = Math.ceil(total / limit);
      
      return { books: paginatedBooks, total, totalPages };
    } catch (error) {
      console.error('Error getting paginated books:', error);
      return { books: [], total: 0, totalPages: 0 };
    }
  },

  // Get genres for a book
  getGenresForBook: async (bookId: string): Promise<Genre[]> => {
    try {
      // This would need a separate table or GSI for book-genre relationships
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting genres for book:', error);
      return [];
    }
  },

  // Set genres for a book
  setGenres: async (bookId: string, genreIds: string[]): Promise<void> => {
    try {
      // This would need a separate table for book-genre relationships
      // For now, do nothing
      console.log(`Setting genres ${genreIds} for book ${bookId}`);
    } catch (error) {
      console.error('Error setting genres for book:', error);
    }
  }
};

// Genre operations
export const genreOperations = {
  // Create a new genre
  create: async (data: { name: string; description?: string }): Promise<Genre | null> => {
    try {
      const genreId = generateId();
      const now = getCurrentTimestamp();
      
      const genreData: Genre = {
        id: genreId,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        created_at: now,
        updated_at: now
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.GENRES,
        Item: genreData
      }));
      
      return genreData;
    } catch (error) {
      console.error('Error creating genre:', error);
      return null;
    }
  },

  // Get a single genre by ID
  getById: async (id: string): Promise<Genre | null> => {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.GENRES,
        Key: { id }
      }));
      
      return result.Item as Genre || null;
    } catch (error) {
      console.error('Error getting genre by ID:', error);
      return null;
    }
  },

  // Get all genres
  getAll: async (): Promise<Genre[]> => {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.GENRES
      }));
      
      return (result.Items || []) as Genre[];
    } catch (error) {
      console.error('Error getting all genres:', error);
      return [];
    }
  }
};

// Reading List operations
export const readingListOperations = {
  // Create a new reading list
  create: async (data: CreateReadingListData): Promise<ReadingList | null> => {
    try {
      const listId = generateId();
      const now = getCurrentTimestamp();
      
      const readingListData: ReadingList = {
        id: listId,
        ...data,
        is_public: data.is_public || false,
        created_at: now,
        updated_at: now
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.READING_LISTS,
        Item: readingListData
      }));
      
      return readingListData;
    } catch (error) {
      console.error('Error creating reading list:', error);
      return null;
    }
  },

  // Get a reading list by ID
  getById: async (id: string): Promise<ReadingList | null> => {
    try {
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.READING_LISTS,
        Key: { id }
      }));
      
      return result.Item as ReadingList || null;
    } catch (error) {
      console.error('Error getting reading list by ID:', error);
      return null;
    }
  },

  // Add a book to a reading list
  addBook: async (data: AddBookToListData): Promise<ReadingListBook | null> => {
    try {
      const now = getCurrentTimestamp();
      
      const bookData: ReadingListBook = {
        id: generateId(),
        reading_list_id: data.reading_list_id,
        book_id: data.book_id,
        position: data.position || 1,
        notes: data.notes || null,
        added_at: now
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.READING_LIST_BOOKS,
        Item: bookData
      }));
      
      return bookData;
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      return null;
    }
  }
};
