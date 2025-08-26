import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database-factory';

// GET /api/user-books/[bookId] - Get user's association for a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate userId is a non-empty string
    if (userId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
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
    const { user_id, read_status, rating, comments } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate user_id is a non-empty string
    if (user_id.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate userId is a non-empty string
    if (userId.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
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