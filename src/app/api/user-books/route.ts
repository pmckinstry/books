import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations, userOperations } from '@/lib/database';

// GET /api/user-books - Get user's book associations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const userIdNum = parseInt(userId);
    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Debug: Check if user exists
    const user = userOperations.getById(userIdNum);
    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${userIdNum} does not exist` },
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
    
    const result = userBookAssociationOperations.getBooksWithUserAssociations(userIdNum, page, limit);
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
    const { user_id, book_id, read_status, rating, comments } = body;

    console.log('Creating user-book association:', { user_id, book_id, read_status, rating, comments });

    if (!user_id || !book_id) {
      return NextResponse.json(
        { error: 'User ID and Book ID are required' },
        { status: 400 }
      );
    }

    // Validate user_id and book_id are numbers
    if (typeof user_id !== 'number' || user_id < 1) {
      return NextResponse.json(
        { error: 'User ID must be a valid positive number' },
        { status: 400 }
      );
    }

    if (typeof book_id !== 'number' || book_id < 1) {
      return NextResponse.json(
        { error: 'Book ID must be a valid positive number' },
        { status: 400 }
      );
    }

    // Debug: Check if user exists
    const user = userOperations.getById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${user_id} does not exist` },
        { status: 404 }
      );
    }

    // Debug: Check if book exists
    const { bookOperations } = await import('@/lib/database');
    const book = bookOperations.getById(book_id);
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
      user_id: user_id,
      book_id,
      read_status,
      rating,
      comments
    };

    const association = userBookAssociationOperations.upsert(associationData);
    return NextResponse.json(association, { status: 201 });
  } catch (error) {
    console.error('Error creating user-book association:', error);
    return NextResponse.json(
      { error: 'Failed to create user-book association' },
      { status: 500 }
    );
  }
} 