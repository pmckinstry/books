import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database';
import { getUserIdFromRequest } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'title';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const search = searchParams.get('search') || '';

    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await userBookAssociationOperations.getReadBooksWithPagination(
      userId,
      page,
      limit,
      sortBy,
      sortOrder,
      search
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching read books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
