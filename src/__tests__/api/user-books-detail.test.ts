import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '@/app/api/user-books/[bookId]/route';

// Mock the database module
vi.mock('@/lib/database', () => ({
  userBookAssociationOperations: {
    getByUserAndBook: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

describe('/api/user-books/[bookId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/user-books/[bookId]', () => {
    it('should return user-book association successfully', async () => {
      const mockAssociation = {
        id: 1,
        user_id: 1,
        book_id: 1,
        read_status: 'read' as const,
        rating: 5,
        comments: 'Great book!',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=1');
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.getByUserAndBook.mockReturnValue(mockAssociation);

      const response = await GET(request, { params });

      expect(mockUserBookAssociationOperations.getByUserAndBook).toHaveBeenCalledWith(1, 1);
      expect(mockNextResponse.json).toHaveBeenCalledWith(mockAssociation);
    });

    it('should return 404 for non-existent association', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=1');
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.getByUserAndBook.mockReturnValue(null);

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Association not found' },
        { status: 404 }
      );
    });

    it('should return 400 for missing userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1');
      const params = Promise.resolve({ bookId: '1' });

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=invalid');
      const params = Promise.resolve({ bookId: '1' });

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid bookId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/invalid?userId=1');
      const params = Promise.resolve({ bookId: 'invalid' });

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=1');
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.getByUserAndBook.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to fetch user-book association' },
        { status: 500 }
      );
    });
  });

  describe('PUT /api/user-books/[bookId]', () => {
    it('should update user-book association successfully', async () => {
      const requestBody = {
        user_id: 1,
        read_status: 'read' as const,
        rating: 5,
        comments: 'Updated comment',
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      const mockAssociation = {
        id: 1,
        user_id: 1,
        book_id: 1,
        read_status: 'read' as const,
        rating: 5,
        comments: 'Updated comment',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockUserBookAssociationOperations.update.mockReturnValue(mockAssociation);

      const response = await PUT(request, { params });

      expect(mockUserBookAssociationOperations.update).toHaveBeenCalledWith(1, 1, {
        read_status: 'read' as const,
        rating: 5,
        comments: 'Updated comment',
      });
      expect(mockNextResponse.json).toHaveBeenCalledWith(mockAssociation);
    });

    it('should return 400 for missing user_id', async () => {
      const requestBody = {
        read_status: 'read' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid user_id', async () => {
      const requestBody = {
        user_id: 'invalid',
        read_status: 'read' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid bookId', async () => {
      const requestBody = {
        user_id: 1,
        read_status: 'read' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/invalid', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: 'invalid' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid read_status', async () => {
      const requestBody = {
        user_id: 1,
        read_status: 'invalid_status' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Read status must be one of: unread, reading, read' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid rating', async () => {
      const requestBody = {
        user_id: 1,
        rating: 6,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    });

    it('should return 404 for non-existent association', async () => {
      const requestBody = {
        user_id: 1,
        read_status: 'read' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.update.mockReturnValue(null);

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Association not found' },
        { status: 404 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const requestBody = {
        user_id: 1,
        read_status: 'read' as const,
      };

      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.update.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to update user-book association' },
        { status: 500 }
      );
    });
  });

  describe('DELETE /api/user-books/[bookId]', () => {
    it('should delete user-book association successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.delete.mockReturnValue(true);

      const response = await DELETE(request, { params });

      expect(mockUserBookAssociationOperations.delete).toHaveBeenCalledWith(1, 1);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { message: 'Association deleted successfully' }
      );
    });

    it('should return 404 for non-existent association', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.delete.mockReturnValue(false);

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Association not found' },
        { status: 404 }
      );
    });

    it('should return 400 for missing userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ bookId: '1' });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'User ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid userId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=invalid', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ bookId: '1' });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid bookId', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/invalid?userId=1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ bookId: 'invalid' });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/user-books/1?userId=1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ bookId: '1' });

      mockUserBookAssociationOperations.delete.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to delete user-book association' },
        { status: 500 }
      );
    });
  });
}); 