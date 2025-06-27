import '@testing-library/jest-dom'
import { vi, afterEach } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  notFound: vi.fn(),
}))

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers() {
    return new Map()
  },
  cookies() {
    return new Map()
  },
}))

// Global test utilities
global.fetch = vi.fn()

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
}) 