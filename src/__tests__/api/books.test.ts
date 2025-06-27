import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database module
vi.mock('@/lib/database', () => ({
  bookOperations: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getPaginated: vi.fn(),
    checkDuplicate: vi.fn(),
  },
}))

// Mock better-sqlite3
vi.mock('better-sqlite3', () => ({
  default: vi.fn().mockImplementation(() => ({
    prepare: vi.fn().mockReturnValue({
      run: vi.fn().mockReturnValue({ lastInsertRowid: 1, changes: 1 }),
      get: vi.fn(),
      all: vi.fn(),
    }),
    close: vi.fn(),
  })),
}))

// Mock path with default export
vi.mock('path', () => ({
  default: { join: vi.fn().mockReturnValue('/mock/path/to/database.db') },
  join: vi.fn().mockReturnValue('/mock/path/to/database.db'),
}))

// Import after mocking
import { GET, POST } from '@/app/api/books/route'
import { bookOperations } from '@/lib/database'

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

const createMockRequest = (overrides = {}): Partial<NextRequest> => {
  const defaultRequest = {
    url: 'http://localhost:3000/api/test',
    method: 'GET',
    headers: new Headers(),
    ...overrides,
  }
  return defaultRequest
}

describe('/api/books', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/books', () => {
    it('should return paginated books with default parameters', async () => {
      const mockPaginatedResult = {
        books: [createMockBook({ id: 1, title: 'Test Book' })],
        total: 1,
        totalPages: 1,
      }
      vi.mocked(bookOperations.getPaginated).mockReturnValue(mockPaginatedResult)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/books',
      }) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(bookOperations.getPaginated).toHaveBeenCalledWith(1, 10, 'created_at', 'desc', undefined)
    })

    it('should return paginated books with search parameters', async () => {
      const mockPaginatedResult = {
        books: [createMockBook({ id: 1, title: 'Test Book' })],
        total: 1,
        totalPages: 1,
      }
      vi.mocked(bookOperations.getPaginated).mockReturnValue(mockPaginatedResult)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/books?page=1&limit=10&search=test&sortBy=title&sortOrder=asc',
      }) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockPaginatedResult)
      expect(bookOperations.getPaginated).toHaveBeenCalledWith(1, 10, 'created_at', 'desc', 'test')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(bookOperations.getPaginated).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/books',
      }) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch books')
    })
  })

  describe('POST /api/books', () => {
    it('should create a new book successfully', async () => {
      const newBook = createMockBook({ id: 1, title: 'New Book' })
      vi.mocked(bookOperations.create).mockReturnValue(newBook)
      vi.mocked(bookOperations.checkDuplicate).mockReturnValue(null)
      vi.mocked(bookOperations.getById).mockReturnValue(newBook)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/books',
        method: 'POST',
      }) as NextRequest

      // Mock the request body
      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          title: 'New Book',
          author: 'New Author',
          description: 'A new book',
          genres: [1, 2],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(newBook)
    })

    it('should return 409 if book already exists', async () => {
      const existingBook = createMockBook({ title: 'Existing Book' })
      vi.mocked(bookOperations.checkDuplicate).mockReturnValue(existingBook)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/books',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          title: 'Existing Book',
          author: 'Existing Author',
          genres: [1],
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toContain('already exists')
    })

    it('should return 400 for invalid book data', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/books',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          // Missing required fields
          description: 'A book without title and author',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Title and author are required')
    })

    it('should return 400 for missing genres', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/books',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          title: 'Test Book',
          author: 'Test Author',
          genres: [], // Empty genres array
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('At least one genre is required')
    })
  })
}) 