import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database';

const normalizeId = (value: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = Number(trimmed);
  if (Number.isFinite(numeric) && numeric > 0 && trimmed === String(numeric)) {
    return numeric;
  }
  return trimmed;
};

// GET /api/user-books/[bookId] - Get user's association for a specific book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId');
    const normalizedUserId = normalizeId(userIdParam);
    if (!normalizedUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const resolvedParams = await params;
    const normalizedBookId = normalizeId(resolvedParams.bookId) ?? resolvedParams.bookId;

    const association = await userBookAssociationOperations.getByUserAndBook(normalizedUserId, normalizedBookId);

    if (!association) {
      return NextResponse.json(null, { status: 200 });
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
    const normalizedUserId = normalizeId(user_id ?? null);
    if (!normalizedUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const resolvedParams = await params;
    const normalizedBookId = normalizeId(resolvedParams.bookId) ?? resolvedParams.bookId;

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

    const association = await userBookAssociationOperations.update(normalizedUserId, normalizedBookId, updateData);
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
    const normalizedUserId = normalizeId(userIdParam);
    if (!normalizedUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const resolvedParams = await params;
    const normalizedBookId = normalizeId(resolvedParams.bookId) ?? resolvedParams.bookId;

    const success = await userBookAssociationOperations.delete(normalizedUserId, normalizedBookId);
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
