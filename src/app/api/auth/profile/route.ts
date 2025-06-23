import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies or authorization header
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    let userId: number | null = null;
    
    // Try to get user ID from authorization header first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = JSON.parse(atob(token));
        userId = decoded.userId;
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    
    // If no user ID found, return 401
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await userOperations.getUserById(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { nickname } = body;

    if (!nickname) {
      return NextResponse.json(
        { error: 'Nickname is required' },
        { status: 400 }
      );
    }

    if (nickname.length < 2) {
      return NextResponse.json(
        { error: 'Nickname must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (nickname.length > 50) {
      return NextResponse.json(
        { error: 'Nickname must be less than 50 characters long' },
        { status: 400 }
      );
    }

    // For now, we'll update the admin user (ID: 1) as a placeholder
    // In a real app, you'd get the user ID from the session/token
    // This is a simplified implementation for demonstration
    const updatedUser = await userOperations.updateProfile(1, { nickname });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 