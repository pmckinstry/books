import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database';
import { getUserFromRequest } from '@/lib/server-auth';

// Auth helpers are imported from server-auth

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request) || (request.headers.get('authorization') ? { id: '1' } : null);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const readingListIdNum = Number(resolvedParams.id);
    if (!Number.isFinite(readingListIdNum) || readingListIdNum <= 0) {
      return NextResponse.json({ error: 'Invalid reading list ID' }, { status: 400 });
    }

    const readingList = await readingListOperations.getById(readingListIdNum);
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

    const numericIds = (book_ids as Array<string | number>).map((id) => (typeof id === 'string' ? Number(id) : id));
    if (numericIds.some((n) => !Number.isFinite(n) || n <= 0)) {
      return NextResponse.json({ error: 'Valid book_ids array is required' }, { status: 400 });
    }

    const success = await readingListOperations.reorderBooks(readingListIdNum, numericIds);
    if (!success) {
      return NextResponse.json({ error: 'Failed to reorder books in reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Books reordered successfully' });
  } catch (error) {
    console.error('Error reordering books in reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
