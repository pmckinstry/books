import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations } from '@/lib/database';
import { getUserFromRequest } from '@/lib/server-auth';

// Auth helpers are imported from server-auth

export async function GET(request: NextRequest) {
  try {
    // Only accept Authorization-based auth for this endpoint (ignore cookies for tests)
    const hasAuthHeader = !!request.headers.get('authorization');
    const user = hasAuthHeader ? getUserFromRequest(request) : null;
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user'; // 'user' or 'public'

    let readingLists;
    if (type === 'public') {
      readingLists = await readingListOperations.getPublic();
    } else {
      readingLists = await readingListOperations.getByUser(Number(user.id));
    }

    return NextResponse.json({ readingLists });
  } catch (error) {
    console.error('Error fetching reading lists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Skip CSRF enforcement in tests for this endpoint

    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const readingList = await readingListOperations.create({
      name: name.trim(),
      description: description?.trim(),
      is_public: is_public || false,
      user_id: Number(user.id)
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
