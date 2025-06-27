import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/books/scrape/route';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn()
  }
}));

// Mock cheerio
vi.mock('cheerio', () => ({
  load: vi.fn(() => {
    const $ = (selector: string) => ({
      text: () => {
        if (selector.includes('bookTitle')) return 'The Great Gatsby';
        if (selector.includes('name')) return 'F. Scott Fitzgerald';
        if (selector.includes('Formatted')) return 'A story of the fabulously wealthy Jay Gatsby...';
        if (selector.includes('publicationInfo')) return 'Published 1925';
        if (selector.includes('coverImage')) return 'http://example.com/cover.jpg';
        if (selector.includes('ISBN')) return 'ISBN: 978-0743273565';
        if (selector.includes('pages')) return '180 pages';
        if (selector.includes('Published by')) return 'Published by Scribner';
        return '';
      },
      attr: () => 'http://example.com/cover.jpg',
      first: () => ({
        text: () => {
          if (selector.includes('bookTitle')) return 'The Great Gatsby';
          if (selector.includes('name')) return 'F. Scott Fitzgerald';
          if (selector.includes('Formatted')) return 'A story of the fabulously wealthy Jay Gatsby...';
          if (selector.includes('publicationInfo')) return 'Published 1925';
          if (selector.includes('coverImage')) return 'http://example.com/cover.jpg';
          return '';
        },
        attr: () => 'http://example.com/cover.jpg'
      })
    });
    return $;
  })
}));

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

import axios from 'axios';

const mockAxios = vi.mocked(axios);

describe('/api/books/scrape', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 400 if URL is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/books/scrape', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ error: 'URL is required' });
    });

    it('should return 400 if URL is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/books/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'invalid-url' })
      });

      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ error: 'Invalid URL format' });
    });

    it('should return 400 if scraping fails', async () => {
      (mockAxios.get as any).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/books/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://goodreads.com/book/show/123' })
      });

      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ 
        error: 'Could not extract book information from the provided URL. Please try a different URL or manually enter the book details.' 
      });
    });

    it('should return 400 if no book data extracted', async () => {
      // Override cheerio mock to return empty strings
      const cheerio = await import('cheerio');
      (cheerio.load as any).mockImplementation(() => {
        return () => ({
          text: () => '',
          attr: () => '',
          first: () => ({ text: () => '', attr: () => '' })
        });
      });

      (mockAxios.get as any).mockResolvedValue({
        data: '<html></html>',
        status: 200
      });

      const request = new NextRequest('http://localhost:3000/api/books/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://www.goodreads.com/book/show/empty' })
      });
      
      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ 
        error: 'Could not extract book information from the provided URL. Please try a different URL or manually enter the book details.' 
      });
    });

    it('should return 200 with scraped book data for successful scraping', async () => {
      // Reset cheerio mock to return expected values
      const cheerio = await import('cheerio');
      (cheerio.load as any).mockImplementation(() => {
        return (selector: string) => ({
          text: () => {
            if (selector.includes('bookTitle')) return 'The Great Gatsby';
            if (selector.includes('name')) return 'F. Scott Fitzgerald';
            if (selector.includes('Formatted')) return 'A story of the fabulously wealthy Jay Gatsby...';
            if (selector.includes('publicationInfo')) return 'Published 1925';
            if (selector.includes('coverImage')) return 'http://example.com/cover.jpg';
            if (selector.includes('ISBN')) return 'ISBN: 978-0743273565';
            if (selector.includes('pages')) return '180 pages';
            if (selector.includes('Published by')) return 'Published by Scribner';
            return '';
          },
          attr: () => 'http://example.com/cover.jpg',
          first: () => ({
            text: () => {
              if (selector.includes('bookTitle')) return 'The Great Gatsby';
              if (selector.includes('name')) return 'F. Scott Fitzgerald';
              if (selector.includes('Formatted')) return 'A story of the fabulously wealthy Jay Gatsby...';
              if (selector.includes('publicationInfo')) return 'Published 1925';
              if (selector.includes('coverImage')) return 'http://example.com/cover.jpg';
              return '';
            },
            attr: () => 'http://example.com/cover.jpg'
          })
        });
      });

      const mockHtml = `
        <html>
          <head><title>Test Book</title></head>
          <body>
            <h1 data-testid="bookTitle">The Great Gatsby</h1>
            <a data-testid="name">F. Scott Fitzgerald</a>
            <span class="Formatted">A story of the fabulously wealthy Jay Gatsby...</span>
            <p data-testid="publicationInfo">Published 1925</p>
            <p>ISBN: 978-0743273565</p>
            <p>180 pages</p>
            <img data-testid="coverImage" src="http://example.com/cover.jpg" />
            <p>Published by Scribner</p>
          </body>
        </html>
      `;

      (mockAxios.get as any).mockResolvedValue({
        data: mockHtml,
        status: 200
      });

      const request = new NextRequest('http://localhost:3000/api/books/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://www.goodreads.com/book/show/4671.The_Great_Gatsby' })
      });
      
      const response = await POST(request) as any;
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('bookData');
      expect(response.data.bookData).toHaveProperty('title');
      expect(response.data.bookData).toHaveProperty('author');
      expect(response.data.bookData.title).toBe('The Great Gatsby');
      expect(response.data.bookData.author).toBe('F. Scott Fitzgerald');
    });

    it('should handle network errors gracefully', async () => {
      (mockAxios.get as any).mockRejectedValue(new Error('Network error'));

      const request = new NextRequest('http://localhost:3000/api/books/scrape', {
        method: 'POST',
        body: JSON.stringify({ url: 'https://goodreads.com/book/show/123' })
      });

      const response = await POST(request) as any;
      
      expect(response.status).toBe(400);
      expect(response.data).toEqual({ 
        error: 'Could not extract book information from the provided URL. Please try a different URL or manually enter the book details.' 
      });
    });
  });
});