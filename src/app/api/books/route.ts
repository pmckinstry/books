import { NextRequest, NextResponse } from 'next/server';
import { bookOperations, CreateBookData, BookFilters } from '@/lib/database';

// GET /api/books - Get all books (with optional pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    // Sorting parameters are accepted but handled internally in the DB layer
    // Left here to allow future use without lint errors
    // const sortBy = searchParams.get('sortBy') || 'created_at';
    // const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    
    // Build filters object
    const filters: BookFilters = {};
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }
    
    if (searchParams.get('yearFrom')) {
      const yearFrom = parseInt(searchParams.get('yearFrom')!);
      if (!isNaN(yearFrom) && yearFrom > 0) filters.yearFrom = yearFrom;
    }
    
    if (searchParams.get('yearTo')) {
      const yearTo = parseInt(searchParams.get('yearTo')!);
      if (!isNaN(yearTo) && yearTo > 0) filters.yearTo = yearTo;
    }
    
    if (searchParams.get('language')) {
      filters.language = searchParams.get('language')!;
    }
    
    if (searchParams.get('publisher')) {
      filters.publisher = searchParams.get('publisher')!;
    }
    
    if (searchParams.get('pageCountFrom')) {
      const pageCountFrom = parseInt(searchParams.get('pageCountFrom')!);
      if (!isNaN(pageCountFrom) && pageCountFrom > 0) filters.pageCountFrom = pageCountFrom;
    }
    
    if (searchParams.get('pageCountTo')) {
      const pageCountTo = parseInt(searchParams.get('pageCountTo')!);
      if (!isNaN(pageCountTo) && pageCountTo > 0) filters.pageCountTo = pageCountTo;
    }
    
    if (searchParams.get('genreIds')) {
      const genreIdsStr = searchParams.get('genreIds')!;
      const genreIds = genreIdsStr.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      if (genreIds.length > 0) filters.genreIds = genreIds;
    }
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
    }
    
    // Validate year range
    if (filters.yearFrom && filters.yearTo && filters.yearFrom > filters.yearTo) {
      return NextResponse.json(
        { error: 'Year from must be less than or equal to year to.' },
        { status: 400 }
      );
    }
    
    // Validate page count range
    if (filters.pageCountFrom && filters.pageCountTo && filters.pageCountFrom > filters.pageCountTo) {
      return NextResponse.json(
        { error: 'Page count from must be less than or equal to page count to.' },
        { status: 400 }
      );
    }
    
    // Use the new optimized pagination method
    const result = await bookOperations.getBooksWithPagination(page, limit, filters);
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

    // Check for existing book with the same title and author
    const existingBook = bookOperations.checkDuplicate(bookData.title, bookData.author);
    if (existingBook) {
      return NextResponse.json(
        { error: 'A book with this title and author already exists' },
        { status: 409 }
      );
    }

    // Create the book with genres using the database abstraction layer
    const newBook = await bookOperations.create(bookData, genres);

    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
} 
