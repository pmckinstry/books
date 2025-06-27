import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, PUT, DELETE } from '@/app/api/reading-lists/[id]/route';

// Mock the database module
vi.mock('@/lib/database', () => ({
  readingListOperations: {
    getById: vi.fn(),
    getByIdWithBooks: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
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

import { readingListOperations } from '@/lib/database';
import { NextResponse } from 'next/server';

const mockReadingListOperations = vi.mocked(readingListOperations);
const mockNextResponse = vi.mocked(NextResponse);

describe('/api/reading-lists/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/reading-lists/[id]', () => {
    it('should return reading list with books successfully', async () => {
      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        books: [
          {
            id: 1,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A story of the fabulously wealthy Jay Gatsby...',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            reading_list_book: {
              id: 1,
              reading_list_id: 1,
              book_id: 1,
              position: 1,
              notes: 'Great book!',
              added_at: '2023-01-01T00:00:00Z',
            },
            genres: [],
          }
        ],
        book_count: 1,
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1');
      const params = Promise.resolve({ id: '1' });

      mockReadingListOperations.getByIdWithBooks.mockReturnValue(mockReadingList);

      const response = await GET(request, { params });

      expect(mockReadingListOperations.getByIdWithBooks).toHaveBeenCalledWith(1);
      expect(mockNextResponse.json).toHaveBeenCalledWith({ readingList: mockReadingList });
    });

    it('should return 404 for non-existent reading list', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/999');
      const params = Promise.resolve({ id: '999' });

      mockReadingListOperations.getByIdWithBooks.mockReturnValue(null);

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Reading list not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid reading list ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/invalid');
      const params = Promise.resolve({ id: 'invalid' });

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid reading list ID' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/1');
      const params = Promise.resolve({ id: '1' });

      mockReadingListOperations.getByIdWithBooks.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
    });
  });

  describe('PUT /api/reading-lists/[id]', () => {
    it('should update reading list successfully', async () => {
      const requestBody = {
        name: 'Updated Reading List',
        description: 'Updated description',
        is_public: false,
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const mockReadingList = {
        id: 1,
        name: 'Updated Reading List',
        description: 'Updated description',
        is_public: false,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.update.mockReturnValue(mockReadingList);

      const response = await PUT(request, { params });

      expect(mockReadingListOperations.update).toHaveBeenCalledWith(1, {
        name: 'Updated Reading List',
        description: 'Updated description',
        is_public: false,
      });
      expect(mockNextResponse.json).toHaveBeenCalledWith({ readingList: mockReadingList });
    });

    it('should return 401 when not authenticated', async () => {
      const requestBody = {
        name: 'Updated Reading List',
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('should return 404 for non-existent reading list', async () => {
      const requestBody = {
        name: 'Updated Reading List',
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/999', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '999' });

      mockReadingListOperations.getById.mockReturnValue(null);

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Reading list not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid reading list ID', async () => {
      const requestBody = {
        name: 'Updated Reading List',
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/invalid', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: 'invalid' });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid reading list ID' },
        { status: 400 }
      );
    });

    it('should return 403 when user does not own the reading list', async () => {
      const requestBody = {
        name: 'Updated Reading List',
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const mockReadingList = {
        id: 1,
        name: 'Original Name',
        description: 'Original description',
        is_public: true,
        user_id: 2, // Different user
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockReadingListOperations.getById.mockReturnValue(mockReadingList);

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Forbidden' },
        { status: 403 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const requestBody = {
        name: 'Updated Reading List',
      };

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const mockReadingList = {
        id: 1,
        name: 'Original Name',
        description: 'Original description',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.update.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await PUT(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
    });
  });

  describe('DELETE /api/reading-lists/[id]', () => {
    it('should delete reading list successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.delete.mockReturnValue(true);

      const response = await DELETE(request, { params });

      expect(mockReadingListOperations.delete).toHaveBeenCalledWith(1);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { message: 'Reading list deleted successfully' }
      );
    });

    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'DELETE',
      });
      const params = Promise.resolve({ id: '1' });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    });

    it('should return 404 for non-existent reading list', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/999', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '999' });

      mockReadingListOperations.getById.mockReturnValue(null);

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Reading list not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid reading list ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/invalid', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: 'invalid' });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid reading list ID' },
        { status: 400 }
      );
    });

    it('should return 403 when user does not own the reading list', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 2, // Different user
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockReadingListOperations.getById.mockReturnValue(mockReadingList);

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Forbidden' },
        { status: 403 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer token',
        },
      });
      const params = Promise.resolve({ id: '1' });

      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
      };

      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.delete.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
    });
  });
}); 