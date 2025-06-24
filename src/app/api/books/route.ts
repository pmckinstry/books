import { NextRequest, NextResponse } from 'next/server';
import { bookOperations, CreateBookData } from '@/lib/database';
import Database from 'better-sqlite3';
import path from 'path';

// GET /api/books - Get all books (with optional pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const search = searchParams.get('search') || undefined;
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
    }
    
    const result = bookOperations.getPaginated(page, limit, 'created_at', 'desc', search);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      title, 
      author, 
      description, 
      isbn, 
      page_count, 
      language, 
      publisher, 
      cover_image_url, 
      publication_date, 
      genres 
    } = body;

    // Validate required fields
    if (!title || !author) {
      return NextResponse.json(
        { error: 'Title and author are required' },
        { status: 400 }
      );
    }

    // Validate ISBN format if provided
    if (isbn && !/^(?:\d{10}|\d{13})$/.test(isbn.replace(/[-\s]/g, ''))) {
      return NextResponse.json(
        { error: 'ISBN must be a valid 10 or 13 digit number' },
        { status: 400 }
      );
    }

    // Validate page count if provided
    if (page_count && (typeof page_count !== 'number' || page_count < 1)) {
      return NextResponse.json(
        { error: 'Page count must be a positive number' },
        { status: 400 }
      );
    }

    // Validate publication date if provided
    if (publication_date && !/^\d{4}-\d{2}-\d{2}$/.test(publication_date)) {
      return NextResponse.json(
        { error: 'Publication date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    // Validate genres
    if (!Array.isArray(genres) || genres.length === 0) {
      return NextResponse.json(
        { error: 'At least one genre is required' },
        { status: 400 }
      );
    }

    const bookData: CreateBookData = {
      title: title.trim(),
      author: author.trim(),
      description: description?.trim(),
      isbn: isbn?.trim(),
      page_count: page_count ? parseInt(page_count) : undefined,
      language: language?.trim() || 'English',
      publisher: publisher?.trim(),
      cover_image_url: cover_image_url?.trim(),
      publication_date: publication_date?.trim()
    };

    // Check for duplicate book
    const existingBook = bookOperations.checkDuplicate(bookData.title, bookData.author);
    if (existingBook) {
      return NextResponse.json(
        { 
          error: `A book with the title "${existingBook.title}" by "${existingBook.author}" already exists.`,
          existingBook: {
            id: existingBook.id,
            title: existingBook.title,
            author: existingBook.author
          }
        },
        { status: 409 }
      );
    }

    const newBook = bookOperations.create(bookData);

    // Save genres
    const dbPath = path.join(process.cwd(), 'data', 'books.db');
    const db = new Database(dbPath);
    const insertBookGenre = db.prepare('INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)');
    for (const genreId of genres) {
      insertBookGenre.run(newBook.id, genreId);
    }
    db.close();

    // Return the book with genres
    const bookWithGenres = bookOperations.getById(newBook.id);
    return NextResponse.json(bookWithGenres, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
} 