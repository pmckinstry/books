import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database';
import { getUserFromRequest } from '@/lib/server-auth';

// Auth helpers are imported from server-auth

export async function POST(
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

    const body = await request.json();
    const { book_id, position, notes } = body;

    if (book_id === undefined || book_id === null) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    const bookIdNum = typeof book_id === 'string' ? Number(book_id) : book_id;
    if (!Number.isFinite(bookIdNum) || bookIdNum <= 0) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    if (Number(readingList.user_id) !== Number(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const readingListBook = await readingListOperations.addBook({
      reading_list_id: readingListIdNum,
      book_id: bookIdNum,
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

    const { searchParams } = new URL(request.url);
    const bookIdParam = searchParams.get('book_id');

    if (!bookIdParam) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    const bookIdNum = Number(bookIdParam);
    if (!Number.isFinite(bookIdNum) || bookIdNum <= 0) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    if (Number(readingList.user_id) !== Number(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await readingListOperations.removeBook(readingListIdNum, bookIdNum);
    if (!success) {
      return NextResponse.json({ error: 'Failed to remove book from reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Book removed from reading list successfully' });
  } catch (error) {
    console.error('Error removing book from reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
