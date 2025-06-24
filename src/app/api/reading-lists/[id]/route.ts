import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database';

// Simple auth check - in a real app you'd use proper JWT/session auth
async function getCurrentUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { id: 1 }; // Assuming admin user has ID 1
  }
  
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid reading list ID' }, { status: 400 });
    }

    const readingList = readingListOperations.getByIdWithBooks(id);
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
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid reading list ID' }, { status: 400 });
    }

    const readingList = readingListOperations.getById(id);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    if (readingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, is_public } = body;

    const updatedReadingList = readingListOperations.update(id, {
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
    const id = parseInt(resolvedParams.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid reading list ID' }, { status: 400 });
    }

    const readingList = readingListOperations.getById(id);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    if (readingList.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = readingListOperations.delete(id);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete reading list' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reading list deleted successfully' });
  } catch (error) {
    console.error('Error deleting reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 