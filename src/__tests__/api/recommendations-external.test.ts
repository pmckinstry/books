import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GoogleBooksGET } from '@/app/api/recommendations/google-books/route';
import { GET as TasteDiveGET } from '@/app/api/recommendations/tastedive/route';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn()
  },
  isAxiosError: vi.fn()
}));

import axios from 'axios';
const mockAxios = vi.mocked(axios);

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({ data, status: options?.status || 200 }))
    }
  };
});

describe('/api/recommendations/external', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/recommendations/google-books', () => {
    it('should return 400 if title is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommendations/google-books');
      const response = await GoogleBooksGET(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ error: 'Book title is required' });
    });

    it('should return recommendations for valid request', async () => {
      // Use book titles that will not be filtered out by the handler's logic
      const mockAuthorResponse = {
        data: {
          items: [
            {
              id: '1',
              volumeInfo: {
                title: 'Completely Different Book',
                authors: ['Test Author 1'],
                description: 'Test description 1',
                imageLinks: {
                  thumbnail: 'http://example.com/thumb1.jpg'
                },
                previewLink: 'http://example.com/preview1',
                publishedDate: '2020-01-01',
                pageCount: 300,
                averageRating: 4.5,
                ratingsCount: 100,
                categories: ['Fiction']
              }
            }
          ],
          totalItems: 1
        }
      };

      const mockGenreResponse = {
        data: {
          items: [
            {
              id: '2',
              volumeInfo: {
                title: 'Another Unique Book',
                authors: ['Test Author 2'],
                description: 'Test description 2',
                imageLinks: {
                  thumbnail: 'http://example.com/thumb2.jpg'
                },
                previewLink: 'http://example.com/preview2',
                publishedDate: '2021-01-01',
                pageCount: 250,
                averageRating: 4.0,
                ratingsCount: 50,
                categories: ['Mystery']
              }
            }
          ],
          totalItems: 1
        }
      };

      // Mock axios to return different responses for different calls
      (mockAxios.get as any)
        .mockResolvedValueOnce(mockAuthorResponse)  // Author search
        .mockResolvedValueOnce(mockGenreResponse)   // First genre search
        .mockRejectedValueOnce(new Error('Genre search failed')) // Second genre search fails
        .mockRejectedValueOnce(new Error('Genre search failed')) // Third genre search fails
        .mockRejectedValueOnce(new Error('Genre search failed')); // Fourth genre search fails

      const request = new NextRequest('http://localhost:3000/api/recommendations/google-books?title=Test&author=Author&limit=5');
      const response = await GoogleBooksGET(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('source', 'Google Books');
      expect(response.data.recommendations).toHaveLength(2);
    });

    it('should handle axios errors gracefully', async () => {
      // Mock all axios calls to fail with rate limit error
      (mockAxios.get as any)
        .mockRejectedValue({ response: { status: 429 } })
        .mockRejectedValue({ response: { status: 429 } })
        .mockRejectedValue({ response: { status: 429 } })
        .mockRejectedValue({ response: { status: 429 } })
        .mockRejectedValue({ response: { status: 429 } });
      (mockAxios.isAxiosError as any).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/recommendations/google-books?title=Test');
      const response = await GoogleBooksGET(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data.recommendations).toHaveLength(0);
      expect(response.data).toHaveProperty('source', 'Google Books');
    });

    it('should handle quota exceeded errors', async () => {
      // Mock all axios calls to fail with quota exceeded error
      (mockAxios.get as any)
        .mockRejectedValue({ response: { status: 403 } })
        .mockRejectedValue({ response: { status: 403 } })
        .mockRejectedValue({ response: { status: 403 } })
        .mockRejectedValue({ response: { status: 403 } })
        .mockRejectedValue({ response: { status: 403 } });
      (mockAxios.isAxiosError as any).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/recommendations/google-books?title=Test');
      const response = await GoogleBooksGET(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data.recommendations).toHaveLength(0);
      expect(response.data).toHaveProperty('source', 'Google Books');
    });

    it('should handle general errors', async () => {
      // Mock all axios calls to fail with general error
      (mockAxios.get as any)
        .mockRejectedValue(new Error('Network error'))
        .mockRejectedValue(new Error('Network error'))
        .mockRejectedValue(new Error('Network error'))
        .mockRejectedValue(new Error('Network error'))
        .mockRejectedValue(new Error('Network error'));
      (mockAxios.isAxiosError as any).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/recommendations/google-books?title=Test');
      const response = await GoogleBooksGET(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data.recommendations).toHaveLength(0);
      expect(response.data).toHaveProperty('source', 'Google Books');
    });
  });

  describe('GET /api/recommendations/tastedive', () => {
    it('should return 400 if title is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/recommendations/tastedive');
      const response = await TasteDiveGET(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ error: 'Book title is required' });
    });

    it('should return recommendations for valid request', async () => {
      const mockResponse = {
        data: {
          similar: {
            info: [
              { name: 'Test Book', type: 'book' }
            ],
            results: [
              {
                name: 'Recommended Book 1',
                type: 'book',
                wTeaser: 'This is a great book',
                wUrl: 'http://example.com/book1',
                yUrl: 'http://example.com/youtube1',
                yID: 'youtube1'
              },
              {
                name: 'Recommended Book 2',
                type: 'book',
                wTeaser: 'Another great book',
                wUrl: 'http://example.com/book2',
                yUrl: 'http://example.com/youtube2',
                yID: 'youtube2'
              }
            ]
          }
        }
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/recommendations/tastedive?title=Test&author=Author&limit=5');
      const response = await TasteDiveGET(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('recommendations');
      expect(response.data).toHaveProperty('source', 'TasteDive');
      expect(response.data.recommendations).toHaveLength(2);
    });

    it('should handle no recommendations found', async () => {
      const mockResponse = {
        data: {
          similar: {
            info: [],
            results: []
          }
        }
      };

      (mockAxios.get as any).mockResolvedValue(mockResponse);

      const request = new NextRequest('http://localhost:3000/api/recommendations/tastedive?title=Test');
      const response = await TasteDiveGET(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toEqual({
        recommendations: [],
        source: 'TasteDive',
        originalQuery: 'Test'
      });
    });

    it('should handle rate limit errors', async () => {
      (mockAxios.get as any).mockRejectedValue({
        response: { status: 429 }
      });
      (mockAxios.isAxiosError as any).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/recommendations/tastedive?title=Test');
      const response = await TasteDiveGET(request) as any;
      
      expect(response.status).toBe(429);
      expect(response.data).toEqual({ error: 'Rate limit exceeded. Please try again later.' });
    });

    it('should handle not found errors', async () => {
      (mockAxios.get as any).mockRejectedValue({
        response: { status: 404 }
      });
      (mockAxios.isAxiosError as any).mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/recommendations/tastedive?title=Test');
      const response = await TasteDiveGET(request) as any;
      
      expect(response.status).toBe(404);
      expect(response.data).toEqual({ error: 'No recommendations found for this book' });
    });

    it('should handle general errors', async () => {
      (mockAxios.get as any).mockRejectedValue(new Error('Network error'));
      (mockAxios.isAxiosError as any).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3000/api/recommendations/tastedive?title=Test');
      const response = await TasteDiveGET(request) as any;
      
      expect(response.status).toBe(500);
      expect(response.data).toEqual({ error: 'Failed to fetch recommendations from TasteDive' });
    });
  });
}); 