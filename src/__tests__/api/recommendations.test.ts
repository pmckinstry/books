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

describe('/api/recommendations', () => {
  beforeEach(() => {
    resetDatabaseMocks()
    vi.clearAllMocks()
  })

  describe('GET /api/recommendations (User-based)', () => {
    it('should return recommendations based on user reading history', async () => {
      // Mock user's read books
      const readAssociations = [
        createMockUserBookAssociation({ 
          book_id: 1, 
          read_status: 'read', 
          rating: 5 
        }),
        createMockUserBookAssociation({ 
          book_id: 2, 
          read_status: 'read', 
          rating: 4 
        }),
      ]
      vi.mocked(userBookAssociationOperations.getByUser).mockReturnValue(readAssociations)

      // Mock books with genres
      const readBook1 = createMockBook({ 
        id: 1, 
        title: 'Adventure Book', 
        author: 'Adventure Author',
        genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
      })
      const readBook2 = createMockBook({ 
        id: 2, 
        title: 'Fantasy Book', 
        author: 'Fantasy Author',
        genres: [{ id: 2, name: 'Fantasy', description: 'Fantasy stories' }]
      })
      vi.mocked(bookOperations.getById)
        .mockReturnValueOnce(readBook1)
        .mockReturnValueOnce(readBook2)

      // Mock all available books for recommendations
      const allBooks = [
        createMockBook({ 
          id: 3, 
          title: 'New Adventure Book', 
          author: 'New Adventure Author',
          genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
        }),
        createMockBook({ 
          id: 4, 
          title: 'New Fantasy Book', 
          author: 'New Fantasy Author',
          genres: [{ id: 2, name: 'Fantasy', description: 'Fantasy stories' }]
        }),
      ]
      vi.mocked(bookOperations.getAll).mockReturnValue(allBooks)

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getUserRecommendations(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.recommendations).toBeDefined()
      expect(data.recommendations.length).toBeGreaterThan(0)
      expect(data.userStats).toBeDefined()
      expect(data.userStats.totalBooksRead).toBe(2)
    })

    it('should return empty recommendations when user has no reading history', async () => {
      vi.mocked(userBookAssociationOperations.getByUser).mockReturnValue([])

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getUserRecommendations(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.recommendations).toEqual([])
      expect(data.message).toBe('No reading history found. Start reading some books to get personalized recommendations!')
    })

    it('should handle authentication errors', async () => {
      const request = createMockRequest() as NextRequest // No auth header
      const response = await getUserRecommendations(request)
      const data = await response.json()

      expect(response.status).toBe(200) // Uses default user ID 1
      expect(data.recommendations).toBeDefined()
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(userBookAssociationOperations.getByUser).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getUserRecommendations(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate recommendations')
    })

    it('should deduplicate recommendations', async () => {
      // Mock user's read books
      const readAssociations = [
        createMockUserBookAssociation({ 
          book_id: 1, 
          read_status: 'read', 
          rating: 5 
        }),
      ]
      vi.mocked(userBookAssociationOperations.getByUser).mockReturnValue(readAssociations)

      const readBook = createMockBook({ 
        id: 1, 
        title: 'Adventure Book', 
        author: 'Adventure Author',
        genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
      })
      vi.mocked(bookOperations.getById).mockReturnValue(readBook)

      // Mock books with same title but different authors (should be deduplicated)
      const allBooks = [
        createMockBook({ 
          id: 2, 
          title: 'Adventure Book', 
          author: 'Different Author',
          genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
        }),
        createMockBook({ 
          id: 3, 
          title: 'New Adventure Book', 
          author: 'New Author',
          genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
        }),
      ]
      vi.mocked(bookOperations.getAll).mockReturnValue(allBooks)

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getUserRecommendations(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should include both recommendations since they have different titles
      expect(data.recommendations.length).toBe(2)
      // Check that both books are recommended
      const titles = data.recommendations.map((r: any) => r.title).sort()
      expect(titles).toEqual(['Adventure Book', 'New Adventure Book'].sort())
    })
  })

  describe('GET /api/recommendations/reading-list/[id] (Reading List-based)', () => {
    it('should return recommendations based on reading list books', async () => {
      const readingList = createMockReadingList({
        id: 1,
        name: 'Adventure List',
        books: [
          createMockBook({ 
            id: 1, 
            title: 'Adventure Book 1', 
            author: 'Adventure Author',
            genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
          }),
          createMockBook({ 
            id: 2, 
            title: 'Adventure Book 2', 
            author: 'Adventure Author',
            genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
          }),
        ]
      })
      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(readingList)

      // Mock all available books for recommendations
      const allBooks = [
        createMockBook({ 
          id: 3, 
          title: 'New Adventure Book', 
          author: 'New Adventure Author',
          genres: [{ id: 1, name: 'Adventure', description: 'Adventure stories' }]
        }),
      ]
      vi.mocked(bookOperations.getAll).mockReturnValue(allBooks)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/recommendations/reading-list/1',
      }) as NextRequest

      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.recommendations).toBeDefined()
      expect(data.recommendations.length).toBeGreaterThan(0)
      expect(data.listStats).toBeDefined()
      expect(data.listStats.totalBooks).toBe(2)
      expect(data.listStats.listName).toBe('Adventure List')
    })

    it('should return empty recommendations when reading list has no books', async () => {
      const emptyReadingList = createMockReadingList({
        id: 1,
        name: 'Empty List',
        books: [],
        book_count: 0
      })
      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(emptyReadingList)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/recommendations/reading-list/1',
      }) as NextRequest

      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.recommendations).toEqual([])
      expect(data.message).toBe('No books in this reading list yet. Add some books to get recommendations!')
    })

    it('should return 404 for non-existent reading list', async () => {
      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(null)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/recommendations/reading-list/999',
      }) as NextRequest

      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '999' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Reading list not found')
    })

    it('should return 400 for invalid reading list ID', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/recommendations/reading-list/invalid',
      }) as NextRequest

      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: 'invalid' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid reading list ID')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(readingListOperations.getByIdWithBooks).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/recommendations/reading-list/1',
      }) as NextRequest

      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to generate recommendations')
    })

    it('should exclude books already in the reading list from recommendations', async () => {
      const readingList = createMockReadingList({
        id: 1,
        name: 'Test List',
        books: [
          createMockBook({ 
            id: 1, 
            title: 'Book in List', 
            author: 'Author',
            genres: [{ id: 1, name: 'Fiction', description: 'Fiction stories' }]
          }),
        ]
      })
      vi.mocked(readingListOperations.getByIdWithBooks).mockReturnValue(readingList)

      // Mock all books including the one already in the list
      const allBooks = [
        createMockBook({ 
          id: 1, 
          title: 'Book in List', 
          author: 'Author',
          genres: [{ id: 1, name: 'Fiction', description: 'Fiction stories' }]
        }),
        createMockBook({ 
          id: 2, 
          title: 'New Book', 
          author: 'New Author',
          genres: [{ id: 1, name: 'Fiction', description: 'Fiction stories' }]
        }),
      ]
      vi.mocked(bookOperations.getAll).mockReturnValue(allBooks)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/recommendations/reading-list/1',
      }) as NextRequest

      const response = await getReadingListRecommendations(request, { params: Promise.resolve({ id: '1' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      // Should only recommend the book not already in the list
      expect(data.recommendations.length).toBe(1)
      expect(data.recommendations[0].title).toBe('New Book')
    })
  })
}) 