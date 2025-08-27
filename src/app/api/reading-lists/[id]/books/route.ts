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

export async function POST(
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
    const { book_id, position, notes } = body;

    if (!book_id) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    const readingListBook = await readingListOperations.addBook({
      reading_list_id: readingListId,
      book_id: book_id,
      position,
      notes
    });

    if (!readingListBook) {
      return NextResponse.json({ error: 'Failed to add book to reading list' }, { status: 500 });
    }

    return NextResponse.json({ readingListBook }, { status: 201 });
  } catch (error) {
    console.error('Error adding book to reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('book_id');

    if (!bookId) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    const success = await (readingListOperations as any).removeBook(readingListId, bookId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to remove book from reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Book removed from reading list successfully' });
  } catch (error) {
    console.error('Error removing book from reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 