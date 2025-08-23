import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp,
  writeBatch,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import bcrypt from 'bcryptjs';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  BOOKS: 'books',
  USER_BOOK_ASSOCIATIONS: 'user_book_associations',
  GENRES: 'genres',
  BOOK_GENRES: 'book_genres',
  READING_LISTS: 'reading_lists',
  READING_LIST_BOOKS: 'reading_list_books'
};

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

export interface CreateUserData {
  username: string;
  password: string;
  nickname?: string;
}

export interface CreateUserBookAssociationData {
  user_id: string;
  book_id: string;
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

export interface AddBookToListData {
  reading_list_id: string;
  book_id: string;
  position?: number;
  notes?: string;
}

// Helper function to convert Firestore timestamp to string
const timestampToString = (timestamp: Timestamp | { seconds: number; nanoseconds: number } | string): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper function to convert Firestore document to typed object
const docToTyped = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    created_at: timestampToString(data.created_at),
    updated_at: timestampToString(data.updated_at)
  } as T;
};

// User operations
export const userOperations = {
  // Create a new user
  create: async (data: CreateUserData): Promise<User | null> => {
    try {
      const hashedPassword = bcrypt.hashSync(data.password, 10);
      
      const userData = {
        username: data.username,
        password: hashedPassword,
        nickname: data.nickname || data.username,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), userData);
      
      // Return the created user (without password)
      const userDoc = await getDoc(docRef);
      if (userDoc.exists()) {
        const user = userDoc.data();
        return {
          id: userDoc.id,
          username: user.username,
          nickname: user.nickname,
          created_at: timestampToString(user.created_at),
          updated_at: timestampToString(user.updated_at)
        };
      }
      return null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  },

  // Get user by ID
  getById: async (id: string): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, id));
      if (!userDoc.exists()) return null;
      
      const user = userDoc.data();
      return {
        id: userDoc.id,
        username: user.username,
        nickname: user.nickname,
        created_at: timestampToString(user.created_at),
        updated_at: timestampToString(user.updated_at)
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
};

// User-Book Association operations
export const userBookAssociationOperations = {
  // Create or update a user-book association
  upsert: async (data: CreateUserBookAssociationData): Promise<UserBookAssociation | null> => {
    try {
      // Check if association already exists
      const q = query(
        collection(db, COLLECTIONS.USER_BOOK_ASSOCIATIONS),
        where('user_id', '==', data.user_id),
        where('book_id', '==', data.book_id)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing association
        const docRef = querySnapshot.docs[0].ref;
        const updates: Partial<User> & { updated_at: ReturnType<typeof serverTimestamp> } = {
          updated_at: serverTimestamp()
        };
        
        if (data.read_status !== undefined) updates.read_status = data.read_status;
        if (data.rating !== undefined) updates.rating = data.rating;
        if (data.comments !== undefined) updates.comments = data.comments;
        
        await updateDoc(docRef, updates);
        return userBookAssociationOperations.getByUserAndBook(data.user_id, data.book_id);
      } else {
        // Create new association
        const associationData = {
          user_id: data.user_id,
          book_id: data.book_id,
          read_status: data.read_status || 'unread',
          rating: data.rating || null,
          comments: data.comments || null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, COLLECTIONS.USER_BOOK_ASSOCIATIONS), associationData);
        const doc = await getDoc(docRef);
        
        if (doc.exists()) {
          const data = doc.data();
          return {
            id: doc.id,
            user_id: data.user_id,
            book_id: data.book_id,
            read_status: data.read_status,
            rating: data.rating,
            comments: data.comments,
            created_at: timestampToString(data.created_at),
            updated_at: timestampToString(data.updated_at)
          };
        }
        return null;
      }
    } catch (error) {
      console.error('Error upserting user-book association:', error);
      return null;
    }
  },

  // Get association by user and book
  getByUserAndBook: async (userId: string, bookId: string): Promise<UserBookAssociation | null> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.USER_BOOK_ASSOCIATIONS),
        where('user_id', '==', userId),
        where('book_id', '==', bookId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        user_id: data.user_id,
        book_id: data.book_id,
        read_status: data.read_status,
        rating: data.rating,
        comments: data.comments,
        created_at: timestampToString(data.created_at),
        updated_at: timestampToString(data.updated_at)
      };
    } catch (error) {
      console.error('Error getting user-book association:', error);
      return null;
    }
  }
};

// Book operations
export const bookOperations = {
  // Create a new book
  create: async (data: CreateBookData, genres?: string[]): Promise<BookWithGenres | null> => {
    try {
      const bookData = {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.BOOKS), bookData);
      
      // Add genres if provided
      if (genres && genres.length > 0) {
        await bookOperations.setGenres(docRef.id, genres);
      }
      
      return bookOperations.getById(docRef.id);
    } catch (error) {
      console.error('Error creating book:', error);
      return null;
    }
  },

  // Get a single book by ID
  getById: async (id: string): Promise<BookWithGenres | null> => {
    try {
      const bookDoc = await getDoc(doc(db, COLLECTIONS.BOOKS, id));
      if (!bookDoc.exists()) return null;
      
      const book = docToTyped<Book>(bookDoc);
      const genres = await bookOperations.getGenresForBook(id);
      
      return { ...book, genres };
    } catch (error) {
      console.error('Error getting book by ID:', error);
      return null;
    }
  },

  // Get genres for a book
  getGenresForBook: async (bookId: string): Promise<Genre[]> => {
    try {
      const q = query(
        collection(db, COLLECTIONS.BOOK_GENRES),
        where('book_id', '==', bookId)
      );
      const querySnapshot = await getDocs(q);
      
      const genreIds = querySnapshot.docs.map(doc => doc.data().genre_id);
      
      if (genreIds.length === 0) return [];
      
      const genres: Genre[] = [];
      for (const genreId of genreIds) {
        const genreDoc = await getDoc(doc(db, COLLECTIONS.GENRES, genreId));
        if (genreDoc.exists()) {
          const genre = docToTyped<Genre>(genreDoc);
          genres.push(genre);
        }
      }
      
      return genres.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting genres for book:', error);
      return [];
    }
  },

  // Set genres for a book (replaces existing genres)
  setGenres: async (bookId: string, genreIds: string[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      
      // Remove existing genres
      const q = query(
        collection(db, COLLECTIONS.BOOK_GENRES),
        where('book_id', '==', bookId)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Add new genres
      genreIds.forEach(genreId => {
        const docRef = doc(collection(db, COLLECTIONS.BOOK_GENRES));
        batch.set(docRef, {
          book_id: bookId,
          genre_id: genreId
        });
      });
      
      await batch.commit();
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
      const genreData = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.GENRES), genreData);
      return genreOperations.getById(docRef.id);
    } catch (error) {
      console.error('Error creating genre:', error);
      return null;
    }
  },

  // Get a single genre by ID
  getById: async (id: string): Promise<Genre | null> => {
    try {
      const genreDoc = await getDoc(doc(db, COLLECTIONS.GENRES, id));
      if (!genreDoc.exists()) return null;
      
      return docToTyped<Genre>(genreDoc);
    } catch (error) {
      console.error('Error getting genre by ID:', error);
      return null;
    }
  }
};

// Reading List operations
export const readingListOperations = {
  // Create a new reading list
  create: async (data: CreateReadingListData): Promise<ReadingList | null> => {
    try {
      const readingListData = {
        ...data,
        is_public: data.is_public || false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.READING_LISTS), readingListData);
      return readingListOperations.getById(docRef.id);
    } catch (error) {
      console.error('Error creating reading list:', error);
      return null;
    }
  },

  // Get a reading list by ID
  getById: async (id: string): Promise<ReadingList | null> => {
    try {
      const readingListDoc = await getDoc(doc(db, COLLECTIONS.READING_LISTS, id));
      if (!readingListDoc.exists()) return null;
      
      return docToTyped<ReadingList>(readingListDoc);
    } catch (error) {
      console.error('Error getting reading list by ID:', error);
      return null;
    }
  },

  // Add a book to a reading list
  addBook: async (data: AddBookToListData): Promise<ReadingListBook | null> => {
    try {
      // Get the next position if not specified
      if (data.position === undefined) {
        const q = query(
          collection(db, COLLECTIONS.READING_LIST_BOOKS),
          where('reading_list_id', '==', data.reading_list_id),
          orderBy('position', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        data.position = querySnapshot.empty ? 1 : querySnapshot.docs[0].data().position + 1;
      }

      const bookData = {
        reading_list_id: data.reading_list_id,
        book_id: data.book_id,
        position: data.position,
        notes: data.notes || null,
        added_at: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.READING_LIST_BOOKS), bookData);
      const doc = await getDoc(docRef);
      
      if (doc.exists()) {
        const data = doc.data();
        return {
          id: doc.id,
          reading_list_id: data.reading_list_id,
          book_id: data.book_id,
          position: data.position,
          notes: data.notes,
          added_at: timestampToString(data.added_at)
        };
      }
      return null;
    } catch (error) {
      console.error('Error adding book to reading list:', error);
      return null;
    }
  }
};
