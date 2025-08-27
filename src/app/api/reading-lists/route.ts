import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database-factory';

// Simple auth check - in a real app you'd use proper JWT/session auth
async function getCurrentUser(request: NextRequest) {
  // For now, we'll use a simple approach
  // In a real app, you'd decode JWT tokens or check session cookies
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // This is a placeholder - in a real app you'd decode a JWT token
    // For now, we'll return the actual admin user UUID
    return { id: '1cf02876-41b7-4019-adb1-7d165b6770a3' }; // Actual admin user UUID
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user'; // 'user' or 'public'

    let readingLists;
    if (type === 'public') {
      readingLists = await (readingListOperations as any).getPublic();
    } else {
      readingLists = await (readingListOperations as any).getByUser(user.id);
    }

    return NextResponse.json({ readingLists });
  } catch (error) {
    console.error('Error fetching reading lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const readingList = await readingListOperations.create({
      name: name.trim(),
      description: description?.trim(),
      is_public: is_public || false,
      user_id: user.id
    });

    if (!readingList) {
      return NextResponse.json({ 
        error: 'A reading list with this name already exists' 
      }, { status: 409 });
    }

    return NextResponse.json({ readingList }, { status: 201 });
  } catch (error) {
    console.error('Error creating reading list:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 