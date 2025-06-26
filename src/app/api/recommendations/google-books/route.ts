import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface GoogleBooksRecommendation {
  title: string;
  author?: string;
  reason: string;
  genre?: string;
  type: 'book';
  description?: string;
  imageUrl?: string;
  previewLink?: string;
  publishedDate?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
}

interface GoogleBooksResponse {
  items?: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      description?: string;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
      previewLink?: string;
      publishedDate?: string;
      pageCount?: number;
      averageRating?: number;
      ratingsCount?: number;
      categories?: string[];
    };
  }>;
  totalItems: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookTitle = searchParams.get('title');
    const author = searchParams.get('author');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    if (!bookTitle) {
      return NextResponse.json(
        { error: 'Book title is required' },
        { status: 400 }
      );
    }

    // Google Books API configuration
    const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
    
    // Try multiple search strategies to find similar books
    let recommendations: GoogleBooksRecommendation[] = [];
    
    // Strategy 1: Search for other books by the same author (excluding the current book)
    if (author) {
      const authorQuery = `inauthor:"${author}"`;
      const authorParams = new URLSearchParams({
        q: authorQuery,
        maxResults: '20',
        orderBy: 'relevance',
        printType: 'books',
        langRestrict: 'en'
      });

      console.log('Google Books API author search:', `${GOOGLE_BOOKS_BASE_URL}?${authorParams.toString()}`);
      
      try {
        const authorResponse = await axios.get<GoogleBooksResponse>(`${GOOGLE_BOOKS_BASE_URL}?${authorParams.toString()}`);
        
        if (authorResponse.data.items) {
          const authorBooks = authorResponse.data.items
            .filter(item => {
              // Filter out the original book and its variations
              const itemTitle = item.volumeInfo.title.toLowerCase();
              const originalTitle = bookTitle.toLowerCase();
              const titleWords = originalTitle.split(' ').filter(word => word.length > 3);
              
              // Check if this is a different book (not just a variation of the same title)
              return !titleWords.some(word => itemTitle.includes(word)) && 
                     !itemTitle.includes(originalTitle) && 
                     !originalTitle.includes(itemTitle);
            })
            .map(item => ({
              title: item.volumeInfo.title,
              author: item.volumeInfo.authors?.join(', '),
              reason: `Another book by ${author}`,
              type: 'book' as const,
              description: item.volumeInfo.description,
              imageUrl: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
              previewLink: item.volumeInfo.previewLink,
              publishedDate: item.volumeInfo.publishedDate,
              pageCount: item.volumeInfo.pageCount,
              averageRating: item.volumeInfo.averageRating,
              ratingsCount: item.volumeInfo.ratingsCount,
              genre: item.volumeInfo.categories?.[0]
            }))
            .slice(0, Math.ceil(limit / 2));
          
          recommendations.push(...authorBooks);
        }
      } catch (error) {
        console.log('Author search failed, trying other strategies...');
      }
    }

    // Strategy 2: Search for books in similar genres/subjects
    const genreQueries = [
      'subject:fiction',
      'subject:literature',
      'subject:classic',
      'subject:adventure'
    ];

    for (const genreQuery of genreQueries) {
      if (recommendations.length >= limit) break;
      
      const genreParams = new URLSearchParams({
        q: genreQuery,
        maxResults: '15',
        orderBy: 'relevance',
        printType: 'books',
        langRestrict: 'en'
      });

      try {
        const genreResponse = await axios.get<GoogleBooksResponse>(`${GOOGLE_BOOKS_BASE_URL}?${genreParams.toString()}`);
        
        if (genreResponse.data.items) {
          const genreBooks = genreResponse.data.items
            .filter(item => {
              // Filter out the original book and already recommended books
              const itemTitle = item.volumeInfo.title.toLowerCase();
              const originalTitle = bookTitle.toLowerCase();
              const isDuplicate = recommendations.some(rec => 
                rec.title.toLowerCase() === itemTitle
              );
              
              return !itemTitle.includes(originalTitle) && 
                     !originalTitle.includes(itemTitle) && 
                     !isDuplicate;
            })
            .map(item => ({
              title: item.volumeInfo.title,
              author: item.volumeInfo.authors?.join(', '),
              reason: `Popular ${genreQuery.replace('subject:', '')} book`,
              type: 'book' as const,
              description: item.volumeInfo.description,
              imageUrl: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
              previewLink: item.volumeInfo.previewLink,
              publishedDate: item.volumeInfo.publishedDate,
              pageCount: item.volumeInfo.pageCount,
              averageRating: item.volumeInfo.averageRating,
              ratingsCount: item.volumeInfo.ratingsCount,
              genre: item.volumeInfo.categories?.[0]
            }))
            .slice(0, limit - recommendations.length);
          
          recommendations.push(...genreBooks);
        }
      } catch (error) {
        console.log(`Genre search for ${genreQuery} failed`);
      }
    }

    // Strategy 3: If we still don't have enough, try a broader search
    if (recommendations.length < limit) {
      const broaderParams = new URLSearchParams({
        q: 'subject:fiction',
        maxResults: '20',
        orderBy: 'relevance',
        printType: 'books',
        langRestrict: 'en'
      });

      try {
        const broaderResponse = await axios.get<GoogleBooksResponse>(`${GOOGLE_BOOKS_BASE_URL}?${broaderParams.toString()}`);
        
        if (broaderResponse.data.items) {
          const broaderBooks = broaderResponse.data.items
            .filter(item => {
              const itemTitle = item.volumeInfo.title.toLowerCase();
              const originalTitle = bookTitle.toLowerCase();
              const isDuplicate = recommendations.some(rec => 
                rec.title.toLowerCase() === itemTitle
              );
              
              return !itemTitle.includes(originalTitle) && 
                     !originalTitle.includes(itemTitle) && 
                     !isDuplicate;
            })
            .map(item => ({
              title: item.volumeInfo.title,
              author: item.volumeInfo.authors?.join(', '),
              reason: 'Popular fiction book',
              type: 'book' as const,
              description: item.volumeInfo.description,
              imageUrl: item.volumeInfo.imageLinks?.thumbnail || item.volumeInfo.imageLinks?.smallThumbnail,
              previewLink: item.volumeInfo.previewLink,
              publishedDate: item.volumeInfo.publishedDate,
              pageCount: item.volumeInfo.pageCount,
              averageRating: item.volumeInfo.averageRating,
              ratingsCount: item.volumeInfo.ratingsCount,
              genre: item.volumeInfo.categories?.[0]
            }))
            .slice(0, limit - recommendations.length);
          
          recommendations.push(...broaderBooks);
        }
      } catch (error) {
        console.log('Broader search failed');
      }
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, limit),
      source: 'Google Books',
      searchStrategies: ['author', 'genre', 'popular'],
      totalFound: recommendations.length
    });

  } catch (error) {
    console.error('Error fetching Google Books recommendations:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.response?.status === 403) {
        return NextResponse.json(
          { error: 'Google Books API quota exceeded' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch recommendations from Google Books' },
      { status: 500 }
    );
  }
} 