import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database-factory';
import { getUserFromRequest, validateCsrf } from '@/lib/server-auth';

// Auth helpers are imported from server-auth

export async function POST(
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
    const { book_id, position, notes } = body;

    if (!book_id) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    // CSRF protection for modifying list contents
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
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

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get('book_id');

    if (!bookId) {
      return NextResponse.json({ error: 'Valid book ID is required' }, { status: 400 });
    }

    // CSRF protection for modifying list contents
    if (!validateCsrf(request)) {
      return NextResponse.json({ error: 'CSRF validation failed' }, { status: 403 });
    }

    const success = await readingListOperations.removeBook(readingListId, bookId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to remove book from reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Book removed from reading list successfully' });
  } catch (error) {
    console.error('Error removing book from reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
