import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations } from '@/lib/database-factory';

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
    let userId: string | number | null = null;
    
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
        } catch {
          // Invalid token
        }
      }
    }
    
    // For now, if we can't get the user ID, we'll use a default
    // This should be replaced with proper authentication
    if (!userId) {
      // Return an error in production, but for demo purposes, use admin user ID
      console.warn('No user ID found in request, using default user ID 1cf02876-41b7-4019-adb1-7d165b6770a3');
      userId = '1cf02876-41b7-4019-adb1-7d165b6770a3';
    } else {
      // Convert number to string for DynamoDB
      userId = userId.toString();
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