import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the database module with inline object literals
vi.mock('@/lib/database', () => ({
  userBookAssociationOperations: {
    getByUser: vi.fn(),
    getReadBooksWithPagination: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  bookOperations: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getPaginated: vi.fn(),
    checkDuplicate: vi.fn(),
  },
  readingListOperations: {
    getByIdWithBooks: vi.fn(),
    getById: vi.fn(),
    getByUser: vi.fn(),
    getPublic: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    addBook: vi.fn(),
    removeBook: vi.fn(),
    getBookInList: vi.fn(),
    updateBookInList: vi.fn(),
  },
}))

// Import after mocking
import { NextRequest } from 'next/server'
import { GET as getUserRecommendations } from '@/app/api/recommendations/route'
import { GET as getReadingListRecommendations } from '@/app/api/recommendations/reading-list/[id]/route'
import { 
  userBookAssociationOperations, 
  bookOperations,
  readingListOperations 
} from '@/lib/database'
import { 
  createMockBook, 
  createMockUserBookAssociation,
  createMockReadingList,
  createMockRequest, 
  createMockRequestWithAuth,
  resetDatabaseMocks 
} from '../utils/test-utils'

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn()
  }
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({
        status: options?.status || 200,
        json: () => Promise.resolve(data),
        ...data
      }))
    }
  };
});

import axios from 'axios';

const mockAxios = vi.mocked(axios);

describe('/api/recommendations', () => {
  beforeEach(() => {
    resetDatabaseMocks()
    vi.clearAllMocks()
  })

  describe('GET /api/recommendations (User-based)', () => {
    it('should return recommendations based on user reading history', async () => {
      const mockUserAssociations = [
        {
          id: 1,
          user_id: 1,
          book_id: 1,
          read_status: 'read' as const,
          rating: 5,
          comments: 'Great book!',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      const mockReadBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby...',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        rating: 5,
        comments: 'Great book!'
      };

      const mockAllBooks = [
        {
          id: 2,
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A story of racial injustice...',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        }
      ];

      vi.mocked(userBookAssociationOperations.getByUser).mockReturnValue(mockUserAssociations);
      vi.mocked(bookOperations.getById).mockReturnValue(mockReadBook);
      vi.mocked(bookOperations.getAll).mockReturnValue(mockAllBooks);

      const request = createMockRequestWithAuth(1) as NextRequest;
      const response = await getUserRecommendations(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
      expect(data).toHaveProperty('userStats');
      expect(data.userStats).toHaveProperty('totalBooksRead', 1);
      expect(data.userStats).toHaveProperty('averageRating', 5);
    })

    it('should return empty recommendations when user has no reading history', async () => {
      vi.mocked(userBookAssociationOperations.getByUser).mockReturnValue([]);

      const request = createMockRequestWithAuth(1) as NextRequest;
      const response = await getUserRecommendations(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
      expect(data).toHaveProperty('message');
      expect(data.recommendations).toHaveLength(0);
    })

    it('should handle authentication errors', async () => {
      const request = createMockRequest() as NextRequest; // No auth header
      const response = await getUserRecommendations(request);

      expect(response.status).toBe(200); // Uses default user ID 1
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(userBookAssociationOperations.getByUser).mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = createMockRequestWithAuth(1) as NextRequest;
      const response = await getUserRecommendations(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Failed to generate recommendations');
    })

    it('should deduplicate recommendations', async () => {
      const mockUserAssociations = [
        {
          id: 1,
          user_id: 1,
          book_id: 1,
          read_status: 'read' as const,
          rating: 5,
          comments: 'Great book!',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
        }
      ];

      const mockReadBook = {
        id: 1,
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A story of the fabulously wealthy Jay Gatsby...',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        rating: 5,
        comments: 'Great book!'
      };

      const mockAllBooks = [
        {
          id: 2,
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A story of racial injustice...',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        },
        {
          id: 3,
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A story of racial injustice...',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        }
      ];

      vi.mocked(userBookAssociationOperations.getByUser).mockReturnValue(mockUserAssociations);
      vi.mocked(bookOperations.getById).mockReturnValue(mockReadBook);
      vi.mocked(bookOperations.getAll).mockReturnValue(mockAllBooks);

      const request = createMockRequestWithAuth(1) as NextRequest;
      const response = await getUserRecommendations(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
      // Should only have one recommendation due to deduplication
      expect(data.recommendations.length).toBeLessThanOrEqual(1);
    })
  })

  describe('GET /api/recommendations/reading-list/[id] (Reading List-based)', () => {
    it('should return recommendations based on reading list books', async () => {
      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        book_count: 1,
        books: [
          {
            id: 1,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A story of the fabulously wealthy Jay Gatsby...',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
            reading_list_book: {
              id: 1,
              reading_list_id: 1,
              book_id: 1,
              position: 1,
              added_at: '2023-01-01T00:00:00Z'
            }
          }
        ]
      };

      const mockAllBooks = [
        {
          id: 2,
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A story of racial injustice...',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        }
      ];

      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(mockReadingList);
      vi.mocked(bookOperations.getAll).mockReturnValue(mockAllBooks);

      const request = new NextRequest('http://localhost:3000/api/recommendations/reading-list/1');
      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
      expect(data).toHaveProperty('listStats');
    })

    it('should return empty recommendations when reading list has no books', async () => {
      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        book_count: 0,
        books: []
      };

      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(mockReadingList);

      const request = new NextRequest('http://localhost:3000/api/recommendations/reading-list/1');
      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
      expect(data.recommendations).toHaveLength(0);
    })

    it('should return 404 for non-existent reading list', async () => {
      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(null);

      const request = new NextRequest('http://localhost:3000/api/recommendations/reading-list/999');
      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Reading list not found');
    })

    it('should return 400 for invalid reading list ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommendations/reading-list/invalid');
      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Invalid reading list ID');
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(readingListOperations.getByIdWithBooks).mockImplementation(() => {
        throw new Error('Database error');
      });

      const request = new NextRequest('http://localhost:3000/api/recommendations/reading-list/1');
      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toHaveProperty('error', 'Failed to generate recommendations');
    })

    it('should exclude books already in the reading list from recommendations', async () => {
      const mockReadingList = {
        id: 1,
        name: 'My Reading List',
        description: 'A great list of books',
        is_public: true,
        user_id: 1,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        book_count: 1,
        books: [
          {
            id: 1,
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            description: 'A story of the fabulously wealthy Jay Gatsby...',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
            reading_list_book: {
              id: 1,
              reading_list_id: 1,
              book_id: 1,
              position: 1,
              added_at: '2023-01-01T00:00:00Z'
            }
          }
        ]
      };

      const mockAllBooks = [
        {
          id: 1, // Same ID as in reading list
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          description: 'A story of the fabulously wealthy Jay Gatsby...',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        },
        {
          id: 2,
          title: 'To Kill a Mockingbird',
          author: 'Harper Lee',
          description: 'A story of racial injustice...',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z',
          genres: [{ id: 1, name: 'Fiction', description: 'Fictional literature' }],
        }
      ];

      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(mockReadingList);
      vi.mocked(bookOperations.getAll).mockReturnValue(mockAllBooks);

      const request = new NextRequest('http://localhost:3000/api/recommendations/reading-list/1');
      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('recommendations');
      // Should not recommend the book that's already in the reading list
      const recommendedTitles = data.recommendations.map((r: any) => r.title);
      expect(recommendedTitles).not.toContain('The Great Gatsby');
    })
  })
}) 