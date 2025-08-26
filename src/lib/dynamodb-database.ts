import { 
  PutCommand, 
  GetCommand, 
  QueryCommand, 
  UpdateCommand, 
  DeleteCommand, 
  ScanCommand
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

// Database Book interface (stored in DynamoDB with genre IDs)
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
  genres?: string[];
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

// API Book interface (returned to frontend with full genre objects)
export interface BookWithGenres extends Omit<Book, 'genres'> {
  genres: Genre[];
}

export interface BookFilters {
  search?: string;
  yearFrom?: number;
  yearTo?: number;
  language?: string;
  publisher?: string;
  pageCountFrom?: number;
  pageCountTo?: number;
  genreIds?: string[];
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
      const updates: Record<string, string> = {};
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};
      
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
      const updates: Record<string, string> = {};
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, unknown> = {};
      
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
        genres: genres || [],
        created_at: now,
        updated_at: now
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.BOOKS,
        Item: bookData
      }));
      
      // Invalidate books cache
      booksCache.clear();
      
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
      
      // Convert genre IDs to full genre objects
      let genres: Genre[] = [];
      if (book.genres && book.genres.length > 0) {
        const genreObjects = await Promise.all(
          book.genres.map(async (genreId: string) => {
            const genre = await genreOperations.getById(genreId);
            return genre;
          })
        );
        
        genres = genreObjects.filter((genre): genre is Genre => genre !== null);
      }
      
      // Return book with genres, excluding the genres field from the original book
      const { genres: _, ...bookWithoutGenres } = book;
      return { ...bookWithoutGenres, genres };
    } catch (error) {
      console.error('Error getting book by ID:', error);
      return null;
    }
  },

  // Get all books (with optional pagination)
  getAll: async (limit?: number, offset?: number): Promise<BookWithGenres[]> => {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.BOOKS,
        ...(limit && { Limit: limit }),
        ...(offset && { ExclusiveStartKey: { id: offset } })
      }));
      
      const books = (result.Items || []) as Book[];
      
      // Get genres for each book
      const booksWithGenres = await Promise.all(
        books.map(async (book) => {
          // Convert genre IDs to full genre objects
          let genres: Genre[] = [];
          if (book.genres && book.genres.length > 0) {
            const genreObjects = await Promise.all(
              book.genres.map(async (genreId: string) => {
                const genre = await genreOperations.getById(genreId);
                return genre;
              })
            );
            
            genres = genreObjects.filter((genre): genre is Genre => genre !== null);
          }
          
          // Return book with genres, excluding the genres field from the original book
          const { genres: _, ...bookWithoutGenres } = book;
          return { ...bookWithoutGenres, genres };
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

  // Get books with pagination and caching
  getBooksWithPagination: async (
    page: number = 1,
    limit: number = 20,
    filters?: BookFilters
  ): Promise<{ books: BookWithGenres[], total: number, totalPages: number, hasMore: boolean }> => {
    try {
      // Create cache key based on parameters
      const cacheKey = `books_${page}_${limit}_${JSON.stringify(filters || {})}`;
      
      // Check cache first
      const cached = booksCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < BOOKS_CACHE_TTL) {
        return cached.books as any;
      }
      
      const offset = (page - 1) * limit;
      
      // Get books with pagination
      const books = await bookOperations.getAll(limit, offset);
      
      // Get total count for pagination info
      const totalResult = await docClient.send(new ScanCommand({
        TableName: TABLES.BOOKS,
        Select: 'COUNT'
      }));
      const total = totalResult.Count || 0;
      
      const totalPages = Math.ceil(total / limit);
      const hasMore = page < totalPages;
      
      const result = {
        books,
        total,
        totalPages,
        hasMore
      };
      
      // Cache the result
      booksCache.set(cacheKey, { books: result as any, timestamp: Date.now() });
      
      return result;
    } catch (error) {
      console.error('Error getting books with pagination:', error);
      return {
        books: [],
        total: 0,
        totalPages: 0,
        hasMore: false
      };
    }
  },

  // Get paginated books
  getPaginated: async (
    page: number = 1, 
    limit: number = 10, 
    sortBy: string = 'created_at', 
    sortOrder: 'asc' | 'desc' = 'desc', 
    filters?: BookFilters
  ): Promise<{ books: BookWithGenres[], total: number, totalPages: number }> => {
    try {
      // For simplicity, get all books and paginate in memory
      // In production, you'd use DynamoDB's pagination features
      const allBooks = await bookOperations.getAll();
      
      let filteredBooks = allBooks;
      
      // Apply filters
      if (filters) {
        // Text search filter
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase();
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            (book.description && book.description.toLowerCase().includes(searchTerm)) ||
            (book.isbn && book.isbn.toLowerCase().includes(searchTerm)) ||
            (book.language && book.language.toLowerCase().includes(searchTerm)) ||
            (book.publisher && book.publisher.toLowerCase().includes(searchTerm))
          );
        }

        // Year range filter (from publication_date)
        if (filters.yearFrom || filters.yearTo) {
          filteredBooks = filteredBooks.filter(book => {
            if (!book.publication_date) return false;
            const bookYear = parseInt(book.publication_date.substring(0, 4));
            if (isNaN(bookYear)) return false;
            
            if (filters.yearFrom && bookYear < filters.yearFrom) return false;
            if (filters.yearTo && bookYear > filters.yearTo) return false;
            return true;
          });
        }

        // Language filter
        if (filters.language && filters.language.trim()) {
          filteredBooks = filteredBooks.filter(book => 
            book.language === filters.language?.trim()
          );
        }

        // Publisher filter
        if (filters.publisher && filters.publisher.trim()) {
          const publisherTerm = filters.publisher.toLowerCase();
          filteredBooks = filteredBooks.filter(book => 
            book.publisher && book.publisher.toLowerCase().includes(publisherTerm)
          );
        }

        // Page count range filter
        if (filters.pageCountFrom || filters.pageCountTo) {
          filteredBooks = filteredBooks.filter(book => {
            if (!book.page_count) return false;
            
            if (filters.pageCountFrom && book.page_count < filters.pageCountFrom) return false;
            if (filters.pageCountTo && book.page_count > filters.pageCountTo) return false;
            return true;
          });
        }

        // Genre filter (this would need to be implemented differently in DynamoDB)
        // For now, we'll skip this filter as it requires joining with genre data
        // TODO: Implement genre filtering for DynamoDB
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

  // Update a book
  update: async (id: string, data: UpdateBookData): Promise<BookWithGenres | null> => {
    try {
      // First, get the current book to ensure it exists
      const currentBook = await bookOperations.getById(id);
      if (!currentBook) {
        return null;
      }

      // Prepare the update expression
      const updateExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {};

      // Add fields to update
      if (data.title !== undefined) {
        updateExpressions.push('#title = :title');
        expressionAttributeNames['#title'] = 'title';
        expressionAttributeValues[':title'] = data.title.trim();
      }
      if (data.author !== undefined) {
        updateExpressions.push('#author = :author');
        expressionAttributeNames['#author'] = 'author';
        expressionAttributeValues[':author'] = data.author.trim();
      }
      if (data.description !== undefined) {
        updateExpressions.push('#description = :description');
        expressionAttributeNames['#description'] = 'description';
        expressionAttributeValues[':description'] = data.description.trim();
      }
      if (data.isbn !== undefined) {
        updateExpressions.push('#isbn = :isbn');
        expressionAttributeNames['#isbn'] = 'isbn';
        expressionAttributeValues[':isbn'] = data.isbn.trim();
      }
      if (data.page_count !== undefined) {
        updateExpressions.push('#page_count = :page_count');
        expressionAttributeNames['#page_count'] = 'page_count';
        expressionAttributeValues[':page_count'] = data.page_count;
      }
      if (data.language !== undefined) {
        updateExpressions.push('#language = :language');
        expressionAttributeNames['#language'] = 'language';
        expressionAttributeValues[':language'] = data.language.trim();
      }
      if (data.publisher !== undefined) {
        updateExpressions.push('#publisher = :publisher');
        expressionAttributeNames['#publisher'] = 'publisher';
        expressionAttributeValues[':publisher'] = data.publisher.trim();
      }
      if (data.cover_image_url !== undefined) {
        updateExpressions.push('#cover_image_url = :cover_image_url');
        expressionAttributeNames['#cover_image_url'] = 'cover_image_url';
        expressionAttributeValues[':cover_image_url'] = data.cover_image_url.trim();
      }
      if (data.publication_date !== undefined) {
        updateExpressions.push('#publication_date = :publication_date');
        expressionAttributeNames['#publication_date'] = 'publication_date';
        expressionAttributeValues[':publication_date'] = data.publication_date.trim();
      }

      // Always update the updated_at timestamp
      updateExpressions.push('#updated_at = :updated_at');
      expressionAttributeNames['#updated_at'] = 'updated_at';
      expressionAttributeValues[':updated_at'] = getCurrentTimestamp();

      if (updateExpressions.length > 0) {
        await docClient.send(new UpdateCommand({
          TableName: TABLES.BOOKS,
          Key: { id },
          UpdateExpression: `SET ${updateExpressions.join(', ')}`,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues
        }));
      }

      // Update genres if provided
      if (data.genres) {
        await bookOperations.setGenres(id, data.genres);
      }

      // Invalidate books cache
      booksCache.clear();
      
      // Return the updated book with genres
      return await bookOperations.getById(id);
    } catch (error) {
      console.error('Error updating book:', error);
      return null;
    }
  },

  // Get genres for a book
  getGenresForBook: async (bookId: string): Promise<Genre[]> => {
    try {
      // Get the raw book data from DynamoDB to access the genres field
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.BOOKS,
        Key: { id: bookId }
      }));
      
      if (!result.Item) return [];
      
      const book = result.Item as Book;
      if (!book.genres || book.genres.length === 0) {
        return [];
      }
      
      // Fetch the actual genre objects for the genre IDs
      const genres = await Promise.all(
        book.genres.map(async (genreId: string) => {
          try {
            const genre = await genreOperations.getById(genreId);
            return genre;
          } catch (error) {
            return null;
          }
        })
      );
      
      // Filter out any null genres and return the valid ones
      const validGenres = genres.filter((genre): genre is Genre => genre !== null);
      
      return validGenres;
    } catch (error) {
      console.error('Error getting genres for book:', error);
      return [];
    }
  },

  // Set genres for a book
  setGenres: async (bookId: string, genreIds: string[]): Promise<void> => {
    try {
      // First, get the current book to ensure it exists
      const currentBookResult = await docClient.send(new GetCommand({
        TableName: TABLES.BOOKS,
        Key: { id: bookId }
      }));
      
      if (!currentBookResult.Item) {
        console.error(`Book ${bookId} not found`);
        return;
      }
      
      const currentBook = currentBookResult.Item as Book;
      
      // Update the book with new genres and updated timestamp
      const updatedBook: Book = {
        ...currentBook,
        genres: genreIds,
        updated_at: getCurrentTimestamp()
      };
      
      // Use PutCommand to ensure the entire book is updated
      await docClient.send(new PutCommand({
        TableName: TABLES.BOOKS,
        Item: updatedBook
      }));
      
      // Invalidate books cache
      booksCache.clear();
    } catch (error) {
      console.error('Error setting genres for book:', error);
    }
  },

  // Delete a book
  delete: async (id: string): Promise<boolean> => {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.BOOKS,
        Key: { id }
      }));
      
      // Invalidate books cache
      booksCache.clear();
      
      return true;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  },

  // Check if a book with the same title and author already exists
  checkDuplicate: async (title: string, author: string, excludeId?: string): Promise<BookWithGenres | null> => {
    try {
      // For DynamoDB, we'll do a scan to check for duplicates
      // In a production app, you'd want to use a GSI for better performance
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.BOOKS,
        FilterExpression: 'title = :title AND author = :author' + (excludeId ? ' AND id <> :excludeId' : ''),
        ExpressionAttributeValues: {
          ':title': title.trim(),
          ':author': author.trim(),
          ...(excludeId && { ':excludeId': excludeId })
        }
      }));
      
      if (result.Items && result.Items.length > 0) {
        const book = result.Items[0] as Book;
        const genres = await bookOperations.getGenresForBook(book.id);
        return { ...book, genres };
      }
      
      return null;
    } catch (error) {
      console.error('Error checking duplicate book:', error);
      return null;
    }
  },

  // Get books by genre ID
  getBooksByGenre: async (genreId: string): Promise<BookWithGenres[]> => {
    try {
      // Scan all books and filter in memory since DynamoDB doesn't support
      // array contains operations efficiently for our use case
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.BOOKS
      }));
      
      const books = (result.Items || []) as Book[];
      
      // Filter books that contain the specified genre ID
      const booksWithGenre = books.filter(book => 
        book.genres && Array.isArray(book.genres) && book.genres.includes(genreId)
      );
      
      // Convert genre IDs to full genre objects for each book
      const booksWithGenres = await Promise.all(
        booksWithGenre.map(async (book) => {
          let genres: Genre[] = [];
          if (book.genres && book.genres.length > 0) {
            const genreObjects = await Promise.all(
              book.genres.map(async (gId: string) => {
                const genre = await genreOperations.getById(gId);
                return genre;
              })
            );
            genres = genreObjects.filter((genre): genre is Genre => genre !== null);
          }
          
          // Return book with genres, excluding the genres field from the original book
          const { genres: _, ...bookWithoutGenres } = book;
          return { ...bookWithoutGenres, genres };
        })
      );
      
      return booksWithGenres.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } catch (error) {
      console.error('Error getting books by genre:', error);
      return [];
    }
  },

  // Clear all caches
  clearCache: () => {
    booksCache.clear();
    console.log('🧹 Books cache cleared');
  }
};

// Genre cache for performance optimization
const genreCache = new Map<string, { genre: Genre; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Books cache for performance optimization
const booksCache = new Map<string, { books: BookWithGenres[]; timestamp: number }>();
const BOOKS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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
        description: data.description?.trim() || null
      };
      
      await docClient.send(new PutCommand({
        TableName: TABLES.GENRES,
        Item: genreData
      }));
      
      // Invalidate cache for this genre
      genreCache.delete(genreId);
      
      return genreData;
    } catch (error) {
      console.error('Error creating genre:', error);
      return null;
    }
  },

  // Get a single genre by ID
  getById: async (id: string): Promise<Genre | null> => {
    try {
      // Check cache first
      const cached = genreCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.genre;
      }
      
      // Fetch from database
      const result = await docClient.send(new GetCommand({
        TableName: TABLES.GENRES,
        Key: { id }
      }));
      
      const genre = result.Item as Genre || null;
      
      // Cache the result if found
      if (genre) {
        genreCache.set(id, { genre, timestamp: Date.now() });
      }
      
      return genre;
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
  },

  // Check if a genre with the same name already exists
  checkDuplicate: async (name: string): Promise<Genre | null> => {
    try {
      const result = await docClient.send(new ScanCommand({
        TableName: TABLES.GENRES,
        FilterExpression: 'name = :name',
        ExpressionAttributeValues: {
          ':name': name.trim()
        }
      }));
      
      if (result.Items && result.Items.length > 0) {
        return result.Items[0] as Genre;
      }
      
      return null;
    } catch (error) {
      console.error('Error checking duplicate genre:', error);
      return null;
    }
  },

  // Update a genre
  update: async (id: string, data: { name: string; description?: string }): Promise<Genre | null> => {
    try {
      // First, get the current genre to ensure it exists
      const currentGenre = await genreOperations.getById(id);
      if (!currentGenre) {
        return null;
      }
      
      // Update the genre with new data
      const updatedGenre: Genre = {
        ...currentGenre,
        name: data.name.trim(),
        description: data.description?.trim() || null
      };
      
      // Use PutCommand to ensure the entire genre is updated
      await docClient.send(new PutCommand({
        TableName: TABLES.GENRES,
        Item: updatedGenre
      }));
      
      // Invalidate cache for this genre
      genreCache.delete(id);
      
      return updatedGenre;
    } catch (error) {
      console.error('Error updating genre:', error);
      return null;
    }
  },

  // Delete a genre
  delete: async (id: string): Promise<boolean> => {
    try {
      await docClient.send(new DeleteCommand({
        TableName: TABLES.GENRES,
        Key: { id }
      }));
      
      // Invalidate cache for this genre
      genreCache.delete(id);
      
      return true;
    } catch (error) {
      console.error('Error deleting genre:', error);
      return false;
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
