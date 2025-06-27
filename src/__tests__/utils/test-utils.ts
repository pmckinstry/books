import { NextRequest } from 'next/server'
import { vi } from 'vitest'

// Mock database operations
export const mockBookOperations = {
  getAll: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  getPaginated: vi.fn(),
  checkDuplicate: vi.fn(),
}

export const mockUserBookAssociationOperations = {
  getByUser: vi.fn(),
  getReadBooksWithPagination: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

export const mockReadingListOperations = {
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
}

export const mockUserOperations = {
  getById: vi.fn(),
  create: vi.fn(),
  authenticate: vi.fn(),
  usernameExists: vi.fn(),
  updateProfile: vi.fn(),
}

// Test data factories
export const createMockBook = (overrides = {}) => ({
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

export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  nickname: 'Test User',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  ...overrides,
})

export const createMockUserBookAssociation = (overrides = {}) => ({
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

export const createMockReadingList = (overrides = {}) => ({
  id: 1,
  name: 'Test Reading List',
  description: 'A test reading list',
  is_public: false,
  user_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  books: [createMockBook()],
  book_count: 1,
  ...overrides,
})

// Request helpers
export const createMockRequest = (overrides = {}): Partial<NextRequest> => {
  const defaultRequest = {
    url: 'http://localhost:3000/api/test',
    method: 'GET',
    headers: new Headers(),
    ...overrides,
  }

  return defaultRequest
}

export const createMockRequestWithAuth = (userId: number): Partial<NextRequest> => {
  const token = Buffer.from(JSON.stringify({ userId })).toString('base64')
  const headers = new Headers()
  headers.set('authorization', `Bearer ${token}`)
  
  return createMockRequest({
    headers,
  })
}

// Database mock setup
export const setupDatabaseMocks = () => {
  vi.mock('@/lib/database', () => ({
    bookOperations: mockBookOperations,
    userBookAssociationOperations: mockUserBookAssociationOperations,
    readingListOperations: mockReadingListOperations,
    userOperations: mockUserOperations,
  }))
}

export const resetDatabaseMocks = () => {
  Object.values(mockBookOperations).forEach(mock => mock.mockReset())
  Object.values(mockUserBookAssociationOperations).forEach(mock => mock.mockReset())
  Object.values(mockReadingListOperations).forEach(mock => mock.mockReset())
  Object.values(mockUserOperations).forEach(mock => mock.mockReset())
} 