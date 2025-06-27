import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/user-books/route';

// Mock the database module
vi.mock('@/lib/database', () => ({
  userBookAssociationOperations: {
    getBooksWithUserAssociations: vi.fn(),
    upsert: vi.fn(),
  },
  userOperations: {
    getById: vi.fn(),
  },
  bookOperations: {
    getById: vi.fn(),
  }
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({ data, options })),
    }
  };
});

import { userBookAssociationOperations, userOperations, bookOperations } from '@/lib/database';
import { NextResponse } from 'next/server';

const mockUserBookAssociationOperations = vi.mocked(userBookAssociationOperations);
const mockUserOperations = vi.mocked(userOperations);
const mockBookOperations = vi.mocked(bookOperations);
const mockNextResponse = vi.mocked(NextResponse);

describe('/api/user-books', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user-books', () => {
    it('should return user book associations with pagination', async () => {
      const mockResult = {
        books: [
          {
            id: 1,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A story of the fabulously wealthy Jay Gatsby...',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            genres: [],
            user_association: {
              id: 1,
              user_id: 1,
              book_id: 1,
              read_status: 'read',
              rating: 5,
              comments: 'Great book!',
              created_at: '2023-01-01T00:00:00Z',
              updated_at: '2023-01-01T00:00:00Z',
            },
          }
        ],
        total: 1,
        totalPages: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books?userId=1&page=1&limit=10');

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockUserBookAssociationOperations.getBooksWithUserAssociations.mockReturnValue(mockResult);

      const response = await GET(request);

      expect(mockUserBookAssociationOperations.getBooksWithUserAssociations).toHaveBeenCalledWith(1, 1, 10);
      expect(mockNextResponse.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 400 for missing userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books');

      const response = await GET(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books?userId=invalid');

      const response = await GET(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    });

    it('should return 404 for non-existent user', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books?userId=999');

      mockUserOperations.getById.mockReturnValue(null);

      const response = await GET(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User with ID 999 does not exist' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books?userId=1&page=0&limit=200');

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockUserOperations.getById.mockReturnValue(mockUser);

      const response = await GET(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books?userId=1');

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockUserBookAssociationOperations.getBooksWithUserAssociations.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user books' },
        { status: 500 }
      );
    });
  });

  describe('POST /api/user-books', () => {
    it('should create user-book association successfully', async () => {
      const requestBody = {
        user_id: 1,
        book_id: 1,
        read_status: 'read',
        rating: 5,
        comments: 'Great book!',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const mockBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby...',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        genres: [],
      };

      const mockAssociation = {
        id: 1,
        user_id: 1,
        book_id: 1,
        read_status: 'read',
        rating: 5,
        comments: 'Great book!',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockBookOperations.getById.mockReturnValue(mockBook);
      mockUserBookAssociationOperations.upsert.mockReturnValue(mockAssociation);

      const response = await POST(request);

      expect(mockUserBookAssociationOperations.upsert).toHaveBeenCalledWith({
        user_id: 1,
        book_id: 1,
        read_status: 'read',
        rating: 5,
        comments: 'Great book!',
      });
      expect(mockNextResponse.json).toHaveBeenCalledWith(mockAssociation, { status: 201 });
    });

    it('should return 400 for missing user_id', async () => {
      const requestBody = {
        book_id: 1,
        read_status: 'read',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID and Book ID are required' },
        { status: 400 }
      );
    });

    it('should return 400 for missing book_id', async () => {
      const requestBody = {
        user_id: 1,
        read_status: 'read',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID and Book ID are required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid user_id', async () => {
      const requestBody = {
        user_id: 'invalid',
        book_id: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID must be a valid positive number' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid book_id', async () => {
      const requestBody = {
        user_id: 1,
        book_id: 'invalid',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Book ID must be a valid positive number' },
        { status: 400 }
      );
    });

    it('should return 404 for non-existent user', async () => {
      const requestBody = {
        user_id: 999,
        book_id: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      mockUserOperations.getById.mockReturnValue(null);

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User with ID 999 does not exist' },
        { status: 404 }
      );
    });

    it('should return 404 for non-existent book', async () => {
      const requestBody = {
        user_id: 1,
        book_id: 999,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockBookOperations.getById.mockReturnValue(null);

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Book with ID 999 does not exist' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid read_status', async () => {
      const requestBody = {
        user_id: 1,
        book_id: 1,
        read_status: 'invalid_status',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const mockBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby...',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        genres: [],
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockBookOperations.getById.mockReturnValue(mockBook);

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Read status must be one of: unread, reading, read' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid rating', async () => {
      const requestBody = {
        user_id: 1,
        book_id: 1,
        rating: 6,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const mockBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby...',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        genres: [],
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockBookOperations.getById.mockReturnValue(mockBook);

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const requestBody = {
        user_id: 1,
        book_id: 1,
        read_status: 'read',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const mockUser = {
        id: 1,
        username: 'testuser',
        nickname: 'Test User',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const mockBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby...',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        genres: [],
      };

      mockUserOperations.getById.mockReturnValue(mockUser);
      mockBookOperations.getById.mockReturnValue(mockBook);
      mockUserBookAssociationOperations.upsert.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await POST(request);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to create user-book association' },
        { status: 500 }
      );
    });
  });
}); 