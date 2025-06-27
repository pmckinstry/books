import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the database module
vi.mock('@/lib/database', () => ({
  genreOperations: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    checkDuplicate: vi.fn(),
    getBooks: vi.fn(),
  },
}))

// Import after mocking
import { GET, POST } from '@/app/api/genres/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/genres/[id]/route'
import { genreOperations } from '@/lib/database'

// Test data factories
const createMockGenre = (overrides = {}) => ({
  id: 1,
  name: 'Fiction',
  description: 'Fictional works',
  ...overrides,
})

const createMockBook = (overrides = {}) => ({
  id: 1,
  title: 'Test Book',
  author: 'Test Author',
  description: 'A test book description',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  genres: [createMockGenre()],
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

describe('/api/genres', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/genres', () => {
    it('should return all genres successfully', async () => {
      const mockGenres = [
        createMockGenre({ id: 1, name: 'Fiction' }),
        createMockGenre({ id: 2, name: 'Adventure' }),
        createMockGenre({ id: 3, name: 'Mystery' }),
      ]

      vi.mocked(genreOperations.getAll).mockReturnValue(mockGenres)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
      }) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ genres: mockGenres })
      expect(genreOperations.getAll).toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(genreOperations.getAll).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
      }) as NextRequest

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toEqual({ genres: [] })
    })
  })

  describe('POST /api/genres', () => {
    it('should create a new genre successfully', async () => {
      const newGenre = createMockGenre({ id: 1, name: 'New Genre' })
      vi.mocked(genreOperations.checkDuplicate).mockReturnValue(null)
      vi.mocked(genreOperations.create).mockReturnValue(newGenre)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'New Genre',
          description: 'A new genre description',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual({
        message: 'Genre created successfully',
        id: 1,
      })
      expect(genreOperations.checkDuplicate).toHaveBeenCalledWith('New Genre')
      expect(genreOperations.create).toHaveBeenCalledWith({
        name: 'New Genre',
        description: 'A new genre description',
      })
    })

    it('should return 409 if genre already exists', async () => {
      const existingGenre = createMockGenre({ id: 1, name: 'Existing Genre' })
      vi.mocked(genreOperations.checkDuplicate).mockReturnValue(existingGenre)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'Existing Genre',
          description: 'A genre that already exists',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Genre already exists')
      expect(genreOperations.checkDuplicate).toHaveBeenCalledWith('Existing Genre')
    })

    it('should return 400 for missing genre name', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          description: 'A genre without a name',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Genre name is required')
    })

    it('should return 400 for empty genre name', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: '   ',
          description: 'A genre with empty name',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Genre name is required')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(genreOperations.checkDuplicate).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres',
        method: 'POST',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'Test Genre',
          description: 'A test genre',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to create genre')
    })
  })
})

describe('/api/genres/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/genres/[id]', () => {
    it('should return genre and books successfully', async () => {
      const mockGenre = createMockGenre({ id: 1, name: 'Fiction' })
      const mockBooks = [createMockBook({ id: 1, title: 'Test Book' })]
      
      vi.mocked(genreOperations.getById).mockReturnValue(mockGenre)
      vi.mocked(genreOperations.getBooks).mockReturnValue(mockBooks)

      const request = createMockRequest() as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        genre: mockGenre,
        books: mockBooks,
      })
      expect(genreOperations.getById).toHaveBeenCalledWith(1)
      expect(genreOperations.getBooks).toHaveBeenCalledWith(1)
    })

    it('should return 404 for non-existent genre', async () => {
      vi.mocked(genreOperations.getById).mockReturnValue(null)

      const request = createMockRequest() as NextRequest
      const params = Promise.resolve({ id: '999' })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Genre not found')
      expect(genreOperations.getById).toHaveBeenCalledWith(999)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(genreOperations.getById).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest() as NextRequest
      const params = Promise.resolve({ id: '1' })

      const response = await GET_BY_ID(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch genre')
    })
  })

  describe('PUT /api/genres/[id]', () => {
    it('should update genre successfully', async () => {
      const updatedGenre = createMockGenre({ id: 1, name: 'Updated Genre' })
      vi.mocked(genreOperations.checkDuplicate).mockReturnValue(null)
      vi.mocked(genreOperations.update).mockReturnValue(updatedGenre)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/1',
        method: 'PUT',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'Updated Genre',
          description: 'Updated description',
        }),
      })

      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Genre updated successfully' })
      expect(genreOperations.checkDuplicate).toHaveBeenCalledWith('Updated Genre', 1)
      expect(genreOperations.update).toHaveBeenCalledWith(1, {
        name: 'Updated Genre',
        description: 'Updated description',
      })
    })

    it('should return 409 if genre name already exists', async () => {
      const existingGenre = createMockGenre({ id: 2, name: 'Existing Genre' })
      vi.mocked(genreOperations.checkDuplicate).mockReturnValue(existingGenre)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/1',
        method: 'PUT',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'Existing Genre',
          description: 'A genre with existing name',
        }),
      })

      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.error).toBe('Genre name already exists')
      expect(genreOperations.checkDuplicate).toHaveBeenCalledWith('Existing Genre', 1)
    })

    it('should return 404 for non-existent genre', async () => {
      vi.mocked(genreOperations.checkDuplicate).mockReturnValue(null)
      vi.mocked(genreOperations.update).mockReturnValue(null)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/999',
        method: 'PUT',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'Updated Genre',
          description: 'Updated description',
        }),
      })

      const params = Promise.resolve({ id: '999' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Genre not found')
      expect(genreOperations.update).toHaveBeenCalledWith(999, {
        name: 'Updated Genre',
        description: 'Updated description',
      })
    })

    it('should return 400 for missing genre name', async () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/1',
        method: 'PUT',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          description: 'A genre without a name',
        }),
      })

      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Genre name is required')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(genreOperations.checkDuplicate).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/1',
        method: 'PUT',
      }) as NextRequest

      Object.defineProperty(request, 'json', {
        value: vi.fn().mockResolvedValue({
          name: 'Test Genre',
          description: 'A test genre',
        }),
      })

      const params = Promise.resolve({ id: '1' })

      const response = await PUT(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update genre')
    })
  })

  describe('DELETE /api/genres/[id]', () => {
    it('should delete genre successfully', async () => {
      vi.mocked(genreOperations.delete).mockReturnValue(true)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/1',
        method: 'DELETE',
      }) as NextRequest

      const params = Promise.resolve({ id: '1' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({ message: 'Genre deleted successfully' })
      expect(genreOperations.delete).toHaveBeenCalledWith(1)
    })

    it('should return 404 for non-existent genre', async () => {
      vi.mocked(genreOperations.delete).mockReturnValue(false)

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/999',
        method: 'DELETE',
      }) as NextRequest

      const params = Promise.resolve({ id: '999' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Genre not found')
      expect(genreOperations.delete).toHaveBeenCalledWith(999)
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(genreOperations.delete).mockImplementation(() => {
        throw new Error('Database error')
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/genres/1',
        method: 'DELETE',
      }) as NextRequest

      const params = Promise.resolve({ id: '1' })

      const response = await DELETE(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to delete genre')
    })
  })
}) 