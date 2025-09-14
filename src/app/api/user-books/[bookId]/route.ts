import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database';

// GET /api/user-books/[bookId] - Get user's association for a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const userIdNum = Number(userIdParam);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const resolvedParams = await params;
    const bookIdNum = Number(resolvedParams.bookId);
    if (!Number.isFinite(bookIdNum) || bookIdNum <= 0) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    const association = await userBookAssociationOperations.getByUserAndBook(userIdNum as string | number, bookIdNum as string | number);
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
    if (user_id === undefined || user_id === null) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (typeof user_id === 'string') {
      const n = Number(user_id);
      if (!Number.isFinite(n) || n <= 0) {
        return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
      }
    }

    const resolvedParams = await params;
    const bookIdNum = Number(resolvedParams.bookId);
    if (!Number.isFinite(bookIdNum) || bookIdNum <= 0) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
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

    const association = await userBookAssociationOperations.update(user_id as string | number, bookIdNum as string | number, updateData);
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
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    const userIdNum = Number(userIdParam);
    if (!Number.isFinite(userIdNum) || userIdNum <= 0) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const resolvedParams = await params;
    const bookIdNum = Number(resolvedParams.bookId);
    if (!Number.isFinite(bookIdNum) || bookIdNum <= 0) {
      return NextResponse.json({ error: 'Invalid book ID' }, { status: 400 });
    }

    const success = await userBookAssociationOperations.delete(userIdNum as string | number, bookIdNum as string | number);
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
