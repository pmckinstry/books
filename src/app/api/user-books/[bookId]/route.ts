import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database-factory';
import { validateCsrf, getUserIdFromRequest } from '@/lib/server-auth';

// GET /api/user-books/[bookId] - Get user's association for a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;
    
    // Validate bookId is a non-empty string
    if (bookId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const association = await userBookAssociationOperations.getByUserAndBook(userId, bookId);
    if (!association) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(association);
  } catch (error) {
    console.error('Error fetching user-book association:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user-book association' },
      { status: 500 }
    );
  }
}

// PUT /api/user-books/[bookId] - Update user's association for a specific book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const body = await request.json();
    const { read_status, rating, comments } = body;
    // Derive user ID from cookie/authorization instead of trusting body
    const user_id = getUserIdFromRequest(request);

    if (!user_id || user_id.trim() === '') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;
    
    // Validate bookId is a non-empty string
    if (bookId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
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

    const updateData = {
      read_status,
      rating,
      comments
    };

    // CSRF protection for updates
    if (!validateCsrf(request)) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }

    const association = await userBookAssociationOperations.update(user_id, bookId, updateData);
    if (!association) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(association);
  } catch (error) {
    console.error('Error updating user-book association:', error);
    return NextResponse.json(
      { error: 'Failed to update user-book association' },
      { status: 500 }
    );
  }
}

// DELETE /api/user-books/[bookId] - Delete user's association for a specific book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    // Derive user ID from cookie/authorization instead of trusting query
    const userId = getUserIdFromRequest(request);
    if (!userId || userId.trim() === '') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookId = resolvedParams.bookId;
    
    // Validate bookId is a non-empty string
    if (bookId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // CSRF protection for deletions
    if (!validateCsrf(request)) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }

    const success = await userBookAssociationOperations.delete(userId, bookId);
    if (!success) {
      return NextResponse.json(
        { error: 'Association not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Association deleted successfully' });
  } catch (error) {
    console.error('Error deleting user-book association:', error);
    return NextResponse.json(
      { error: 'Failed to delete user-book association' },
      { status: 500 }
    );
  }
} 
