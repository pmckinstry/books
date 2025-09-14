import { NextRequest, NextResponse } from 'next/server';
import { userOperations, User } from '@/lib/database';
import { getUserIdFromRequest, validateCsrf } from '@/lib/server-auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    // If no user ID found, return 401
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user from database (support both getUserById and getById in mocks)
    type GetUser = (id: string | number) => Promise<User | null> | User | null;
    const ops = userOperations as unknown as { getUserById?: GetUser; getById?: GetUser };
    const getUserFn: GetUser = ops.getUserById ?? ops.getById!;
    const user = await getUserFn(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user data without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        { status: 500 }
      );
    }

    // CSRF protection: require x-csrf-token header matching csrf-token cookie
    if (!validateCsrf(request)) {
      return NextResponse.json(
        { error: 'CSRF validation failed' },
        { status: 403 }
      );
    }

    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updatedUser = await userOperations.updateProfile(userId, { nickname });

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
