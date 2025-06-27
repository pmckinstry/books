import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, DELETE } from '@/app/api/reading-lists/[id]/books/route';

// Mock the database module
vi.mock('@/lib/database', () => ({
  readingListOperations: {
    getById: vi.fn(),
    addBook: vi.fn(),
    removeBook: vi.fn(),
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

import { readingListOperations, bookOperations } from '@/lib/database';
import { NextResponse } from 'next/server';

const mockReadingListOperations = vi.mocked(readingListOperations);
const mockBookOperations = vi.mocked(bookOperations);
const mockNextResponse = vi.mocked(NextResponse);

describe('/api/reading-lists/[id]/books', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNextResponse.json.mockImplementation((data, options) => ({
      status: options?.status || 200,
      data
    } as any));
  });

  describe('POST /api/reading-lists/[id]/books', () => {
    it('should add book to reading list successfully', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const mockReadingListBook = { 
        id: 1, 
        reading_list_id: 1, 
        book_id: 1, 
        position: 1,
        added_at: new Date().toISOString()
      };
      
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.addBook.mockReturnValue(mockReadingListBook);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          book_id: 1,
          position: 1,
          notes: 'Test notes'
        })
      });

      const params = Promise.resolve({ id: '1' });
      const response = await POST(request, { params });

      expect(mockReadingListOperations.addBook).toHaveBeenCalledWith({
        reading_list_id: 1,
        book_id: 1,
        position: 1,
        notes: 'Test notes'
      });
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { readingListBook: mockReadingListBook },
        { status: 201 }
      );
    });

    it('should return 404 for non-existent reading list', async () => {
      mockReadingListOperations.getById.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/999/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          book_id: 1,
          position: 1
        })
      });

      const params = Promise.resolve({ id: '999' });
      const response = await POST(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Reading list not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid reading list ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/invalid/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          book_id: 1,
          position: 1
        })
      });

      const params = Promise.resolve({ id: 'invalid' });
      const response = await POST(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid reading list ID' },
        { status: 400 }
      );
    });

    it('should return 400 for missing book_id', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          position: 1,
          notes: 'Test notes'
        })
      });

      const params = Promise.resolve({ id: '1' });
      const response = await POST(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Valid book ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid book_id', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          book_id: 'invalid',
          position: 1
        })
      });

      const params = Promise.resolve({ id: '1' });
      const response = await POST(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Valid book ID is required' },
        { status: 400 }
      );
    });

    it('should return 404 for non-existent book', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.addBook.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          book_id: 999,
          position: 1
        })
      });

      const params = Promise.resolve({ id: '1' });
      const response = await POST(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Failed to add book to reading list' },
        { status: 500 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.addBook.mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          book_id: 1,
          position: 1
        })
      });

      const params = Promise.resolve({ id: '1' });
      const response = await POST(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
    });
  });

  describe('DELETE /api/reading-lists/[id]/books', () => {
    it('should remove book from reading list successfully', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.removeBook.mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books?book_id=1', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      });

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE(request, { params });

      expect(mockReadingListOperations.removeBook).toHaveBeenCalledWith(1, 1);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { message: 'Book removed from reading list successfully' }
      );
    });

    it('should return 404 for non-existent reading list', async () => {
      mockReadingListOperations.getById.mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/999/books?book_id=1', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      });

      const params = Promise.resolve({ id: '999' });
      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Reading list not found' },
        { status: 404 }
      );
    });

    it('should return 400 for invalid reading list ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/reading-lists/invalid/books?book_id=1', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      });

      const params = Promise.resolve({ id: 'invalid' });
      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Invalid reading list ID' },
        { status: 400 }
      );
    });

    it('should return 400 for missing bookId parameter', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      });

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Valid book ID is required' },
        { status: 400 }
      );
    });

    it('should return 400 for invalid bookId parameter', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books?book_id=invalid', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      });

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Valid book ID is required' },
        { status: 400 }
      );
    });

    it('should handle database errors gracefully', async () => {
      const mockReadingList = { 
        id: 1, 
        user_id: 1, 
        name: 'Test List',
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockReadingListOperations.getById.mockReturnValue(mockReadingList);
      mockReadingListOperations.removeBook.mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/reading-lists/1/books?book_id=1', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer valid-token'
        }
      });

      const params = Promise.resolve({ id: '1' });
      const response = await DELETE(request, { params });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'Internal server error' },
        { status: 500 }
      );
    });
  });
}); 