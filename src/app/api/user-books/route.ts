import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations, userOperations, bookOperations } from '@/lib/database';
import { getUserIdFromRequest } from '@/lib/server-auth';

// GET /api/user-books - Get user's book associations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    // Validate required userId query param
    if (!userIdParam) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    const userIdNum = Number(userIdParam);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Debug: Check if user exists
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100.' },
        { status: 400 }
      );
    }

    const user = await userOperations.getById(userIdNum as string | number);
    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${userIdParam} does not exist` },
        { status: 404 }
      );
    }
    
    const result = await userBookAssociationOperations.getBooksWithUserAssociations(userIdNum as string | number, page, limit);
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

    // Derive user ID from cookie/authorization; fall back to body for tests/clients
    const derivedUserId = getUserIdFromRequest(request);
    const user_id = derivedUserId ?? body.user_id;

    if (user_id === undefined || user_id === null || book_id === undefined || book_id === null) {
      return NextResponse.json(
        { error: 'User ID and Book ID are required' },
        { status: 400 }
      );
    }

    // Validate user_id must be positive number when provided as string/number
    const normalizeId = (value: unknown): string | number | null => {
      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
      }
      if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
      }
      return null;
    };

    const normalizedUserId = normalizeId(user_id);
    if (
      normalizedUserId === null ||
      (typeof normalizedUserId === 'number' && normalizedUserId <= 0)
    ) {
      return NextResponse.json(
        { error: 'User ID must be a non-empty string or positive number' },
        { status: 400 }
      );
    }

    const normalizedBookId = normalizeId(book_id);
    if (
      normalizedBookId === null ||
      (typeof normalizedBookId === 'number' && normalizedBookId <= 0)
    ) {
      return NextResponse.json(
        { error: 'Book ID must be a non-empty string or positive number' },
        { status: 400 }
      );
    }

    console.log('Validation passed - proceeding with database operations');

    // Debug: Check if user exists
    const user = await userOperations.getById(normalizedUserId);
    if (!user) {
      return NextResponse.json(
        { error: `User with ID ${normalizedUserId} does not exist` },
        { status: 404 }
      );
    }

    // Debug: Check if book exists
    const book = await bookOperations.getById(normalizedBookId);
    if (!book) {
      return NextResponse.json(
        { error: `Book with ID ${normalizedBookId} does not exist` },
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
      user_id: normalizedUserId,
      book_id: normalizedBookId,
      read_status,
      rating,
      comments
    };

    console.log('Creating association with data:', associationData);

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
