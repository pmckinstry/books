import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the database module at the very top
vi.mock('@/lib/database', () => ({
  userBookAssociationOperations: {
    getByUser: vi.fn(),
    getReadBooksWithPagination: vi.fn(),
    upsert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import { NextRequest } from 'next/server'
import { GET as getReadBooks } from '@/app/api/user-books/read/route'
import { userBookAssociationOperations } from '@/lib/database'

// Test data factories
const createMockBook = (overrides = {}) => ({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  description: 'A test book description',
  isbn: '978-1234567890',
  page_count: 300,
  language: 'English',
  publisher: 'Test Publisher',
  cover_image_url: 'https://example.com/cover.jpg',
  publication_date: '2023-01-01',
  user_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  genres: [
    { id: 1, name: 'Fiction', description: 'Fictional works' },
    { id: 2, name: 'Adventure', description: 'Adventure stories' }
  ],
  ...overrides,
})

const createMockUserBookAssociation = (overrides = {}) => ({
  id: 1,
  user_id: 1,
  book_id: 1,
  read_status: 'read' as const,
  rating: 4,
  comments: 'Great book!',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
})

const createMockRequest = (overrides = {}): Partial<NextRequest> => {
  const defaultRequest = {
    url: 'http://localhost:3000/api/test',
    method: 'GET',
    headers: new Headers(),
    ...overrides,
  }
  return defaultRequest
}

const createMockRequestWithAuth = (userId: number): Partial<NextRequest> => {
  const token = Buffer.from(JSON.stringify({ userId })).toString('base64')
  const headers = new Headers()
  headers.set('authorization', `Bearer ${token}`)
  
  return createMockRequest({
    headers,
  })
}

describe('/api/user-books', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/user-books/read', () => {
    it('should return user read books with pagination', async () => {
      const mockReadBooks = [
        {
          ...createMockBook({ id: 1, title: 'Read Book 1' }),
          user_association: createMockUserBookAssociation({ 
            book_id: 1, 
            read_status: 'read', 
            rating: 5 
          })
        },
        {
          ...createMockBook({ id: 2, title: 'Read Book 2' }),
          user_association: createMockUserBookAssociation({ 
            book_id: 2, 
            read_status: 'read', 
            rating: 4 
          })
        },
      ]

      const mockPaginatedResult = {
        books: mockReadBooks,
        total: 2,
        totalPages: 1,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(mockPaginatedResult)

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(userBookAssociationOperations.getReadBooksWithPagination).toHaveBeenCalledWith(
        1, // userId
        1, // page
        10, // limit
        'title', // sortBy
        'asc', // sortOrder
        '' // search (API defaults to empty string)
      )
    })

    it('should handle search parameters', async () => {
      const mockPaginatedResult = {
        books: [createMockBook({ id: 1, title: 'Search Result' })],
        total: 1,
        totalPages: 1,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(mockPaginatedResult)

      const request = createMockRequestWithAuth(1) as NextRequest
      // Mock URL with search parameter
      Object.defineProperty(request, 'url', {
        value: 'http://localhost:3000/api/user-books/read?search=adventure',
      })

      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(userBookAssociationOperations.getReadBooksWithPagination).toHaveBeenCalledWith(
        1, // userId
        1, // page
        10, // limit
        'title', // sortBy
        'asc', // sortOrder
        'adventure' // search
      )
    })

    it('should handle pagination parameters', async () => {
      const mockPaginatedResult = {
        books: [],
        total: 0,
        totalPages: 0,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(mockPaginatedResult)

      const request = createMockRequestWithAuth(1) as NextRequest
      // Mock URL with pagination parameters
      Object.defineProperty(request, 'url', {
        value: 'http://localhost:3000/api/user-books/read?page=2&limit=5&sortBy=author&sortOrder=desc',
      })

      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(userBookAssociationOperations.getReadBooksWithPagination).toHaveBeenCalledWith(
        1, // userId
        2, // page
        5, // limit
        'author', // sortBy
        'desc', // sortOrder
        '' // search (empty string when no search param)
      )
    })

    it('should handle invalid pagination parameters gracefully', async () => {
      const mockPaginatedResult = {
        books: [],
        total: 0,
        totalPages: 0,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(mockPaginatedResult)

      const request = createMockRequestWithAuth(1) as NextRequest
      // Mock URL with invalid pagination parameters
      Object.defineProperty(request, 'url', {
        value: 'http://localhost:3000/api/user-books/read?page=invalid&limit=invalid&sortBy=invalid&sortOrder=invalid',
      })

      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      // API passes through invalid parameters as-is
      expect(userBookAssociationOperations.getReadBooksWithPagination).toHaveBeenCalledWith(
        1, // userId
        NaN, // page (invalid)
        NaN, // limit (invalid)
        'invalid', // sortBy (invalid)
        'invalid', // sortOrder (invalid)
        '' // search (empty string)
      )
    })

    it('should handle authentication via cookies', async () => {
      const mockPaginatedResult = {
        books: [],
        total: 0,
        totalPages: 0,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(mockPaginatedResult)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/user-books/read',
      }) as NextRequest
      
      // Mock cookies
      Object.defineProperty(request, 'headers', {
        value: new Headers({
          'cookie': 'user-id=123',
        }),
      })

      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(userBookAssociationOperations.getReadBooksWithPagination).toHaveBeenCalledWith(
        123, // userId from cookie
        1, // page
        10, // limit
        'title', // sortBy
        'asc', // sortOrder
        '' // search (empty string)
      )
    })

    it('should use default user ID when no authentication is provided', async () => {
      const mockPaginatedResult = {
        books: [],
        total: 0,
        totalPages: 0,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(mockPaginatedResult)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/user-books/read',
      }) as NextRequest

      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      // Should use default user ID 1
      expect(userBookAssociationOperations.getReadBooksWithPagination).toHaveBeenCalledWith(
        1, // default userId
        1, // page
        10, // limit
        'title', // sortBy
        'asc', // sortOrder
        '' // search (empty string)
      )
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Internal server error')
    })

    it('should handle malformed authorization token', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/user-books/read',
      }) as NextRequest
      
      // Mock malformed authorization header
      Object.defineProperty(request, 'headers', {
        value: new Headers({
          'authorization': 'Bearer invalid-token',
        }),
      })

      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      // API returns 500 for malformed tokens
      expect(data.error).toBe('Internal server error')
    })

    it('should return empty results when user has no read books', async () => {
      const emptyResult = {
        books: [],
        total: 0,
        totalPages: 0,
      }
      vi.mocked(userBookAssociationOperations.getReadBooksWithPagination).mockReturnValue(emptyResult)

      const request = createMockRequestWithAuth(1) as NextRequest
      const response = await getReadBooks(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.books).toEqual([])
      expect(data.total).toBe(0)
      expect(data.totalPages).toBe(0)
    })
  })
}) 