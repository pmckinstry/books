import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database-factory';

// Simple auth check - in a real app you'd use proper JWT/session auth
async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { id: 'admin-user-id' }; // Assuming admin user has UUID
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const readingList = await readingListOperations.getByIdWithBooks(id);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    return NextResponse.json({ readingList });
  } catch (error) {
    console.error('Error fetching reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
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
    const id = resolvedParams.id;

    const readingList = await readingListOperations.getById(id);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    if (readingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, is_public } = body;

    const updatedReadingList = await readingListOperations.update(id, {
      name: name?.trim(),
      description: description?.trim(),
      is_public: is_public !== undefined ? Boolean(is_public) : undefined
    });

    if (!updatedReadingList) {
      return NextResponse.json({ error: 'Failed to update reading list' }, { status: 500 });
    }

    return NextResponse.json({ readingList: updatedReadingList });
  } catch (error) {
    console.error('Error updating reading list:', error);
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
    const id = resolvedParams.id;

    const readingList = await readingListOperations.getById(id);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    if (readingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await readingListOperations.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reading list deleted successfully' });
  } catch (error) {
    console.error('Error deleting reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 