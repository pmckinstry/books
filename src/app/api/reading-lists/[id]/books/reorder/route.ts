import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database-factory';
import { getUserFromRequest, validateCsrf } from '@/lib/server-auth';

// Auth helpers are imported from server-auth

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const readingListId = resolvedParams.id;

    const readingList = await readingListOperations.getById(readingListId);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    if (readingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { book_ids } = body;

    if (!Array.isArray(book_ids) || book_ids.length === 0) {
      return NextResponse.json({ error: 'Valid book_ids array is required' }, { status: 400 });
    }

    // CSRF protection for modifying list order
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
    }

    const success = await readingListOperations.reorderBooks(readingListId, book_ids);
    if (!success) {
      return NextResponse.json({ error: 'Failed to reorder books in reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Books reordered successfully' });
  } catch (error) {
    console.error('Error reordering books in reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
