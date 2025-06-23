import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'title';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const search = searchParams.get('search') || '';

    // In a real app, you'd use proper session management or JWT tokens
    const cookieHeader = request.headers.get('cookie');
    let userId: number | null = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      // Try to get user ID from a custom cookie
      if (cookies['user-id']) {
        userId = parseInt(cookies['user-id']);
      }
    }
    
    // Fallback: try to get from Authorization header
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // In a real app, you'd decode the JWT token here
        // For now, we'll use a simple approach
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
          userId = decoded.userId;
        } catch (e) {
          // Invalid token
        }
      }
    }
    
    // For now, if we can't get the user ID, we'll use a default
    // This should be replaced with proper authentication
    if (!userId) {
      // Return an error in production, but for demo purposes, use user ID 1
      console.warn('No user ID found in request, using default user ID 1');
      userId = 1;
    }

    const result = userBookAssociationOperations.getReadBooksWithPagination(
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