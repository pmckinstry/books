import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations, userOperations, bookOperations } from '@/lib/database-factory';
import { validateCsrf, getUserIdFromRequest } from '@/lib/server-auth';

// GET /api/user-books - Get user's book associations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    const userId = getUserIdFromRequest(request);
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug: Check if user exists
    const user = await userOperations.getById(userId);
    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${userId} does not exist` },
        { status: 404 }
      );
    }
    
    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
    }
    
    const result = await userBookAssociationOperations.getBooksWithUserAssociations(userId, page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching user books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user books' },
      { status: 500 }
    );
  }
}

// POST /api/user-books - Create or update a user-book association
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { book_id, read_status, rating, comments } = body;

    console.log('Creating user-book association - Raw body:', body);
    console.log('Creating user-book association - book_id type:', typeof book_id, 'value:', book_id);

    // Derive user ID from cookie/authorization instead of trusting body
    const user_id = getUserIdFromRequest(request);

    if (!user_id || !book_id) {
      return NextResponse.json(
        { error: 'User ID and Book ID are required' },
        { status: 400 }
      );
    }

    // Validate user_id and book_id are strings
    if (typeof user_id !== 'string' || user_id.trim() === '') {
      console.error('Validation failed - derived user_id is not a valid string:', typeof user_id, user_id);
      return NextResponse.json(
        { error: 'User ID must be a valid string' },
        { status: 400 }
      );
    }

    if (typeof book_id !== 'string' || book_id.trim() === '') {
      console.error('Validation failed - book_id is not a valid string:', typeof book_id, book_id);
      return NextResponse.json(
        { error: 'Book ID must be a valid string' },
        { status: 400 }
      );
    }

    console.log('Validation passed - proceeding with database operations');

    // Debug: Check if user exists
    const user = await userOperations.getById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${user_id} does not exist` },
        { status: 404 }
      );
    }

    // Debug: Check if book exists
    const book = await bookOperations.getById(book_id);
    if (!book) {
      return NextResponse.json(
        { error: `Book with ID ${book_id} does not exist` },
        { status: 404 }
      );
    }

    // Validate read_status if provided
    if (read_status && !['unread', 'reading', 'read'].includes(read_status)) {
      return NextResponse.json(
        { error: 'Read status must be one of: unread, reading, read' },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    const associationData = {
      user_id,
      book_id,
      read_status,
      rating,
      comments
    };

    console.log('Creating association with data:', associationData);

    // CSRF protection for creating/updating associations
    if (!validateCsrf(request)) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }

    const association = await userBookAssociationOperations.upsert(associationData);
    return NextResponse.json(association, { status: 201 });
  } catch (error) {
    console.error('Error creating user-book association:', error);
    return NextResponse.json(
      { error: 'Failed to create user-book association' },
      { status: 500 }
    );
  }
} 
