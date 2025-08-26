import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/database-factory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    console.log('Attempting to authenticate user...');
    const user = await userOperations.authenticate({ username, password });

    if (!user) {
      console.log('Authentication failed - no user returned');
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    console.log('Authentication successful - user data:', {
      id: user.id,
      idType: typeof user.id,
      username: user.username,
      hasPassword: !!user.password
    });

    return NextResponse.json({
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 