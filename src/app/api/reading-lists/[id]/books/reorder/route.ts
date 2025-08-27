import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database-factory';

// Simple auth check - in a real app you'd use proper JWT/session auth
async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { id: '1cf02876-41b7-4019-adb1-7d165b6770a3' }; // Actual admin user UUID
  }

  return null;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
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

    const success = await (readingListOperations as any).reorderBooks(readingListId, book_ids);
    if (!success) {
      return NextResponse.json({ error: 'Failed to reorder books in reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Books reordered successfully' });
  } catch (error) {
    console.error('Error reordering books in reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
