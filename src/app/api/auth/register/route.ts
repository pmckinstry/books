import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/database-factory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, nickname } = body;

    console.log('Registration attempt for username:', username);

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    // TODO: Fix this once database interface is unified
    // if (userOperations.usernameExists && await userOperations.usernameExists(username)) {
    //   return NextResponse.json(
    //     { error: 'Username already exists' },
    //     { status: 409 }
    //   );
    // }

    console.log('Creating new user...');
    const user = await userOperations.create({ username, password, nickname });

    if (!user) {
      console.log('Failed to create user');
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log('User created successfully:', {
      id: user.id,
      idType: typeof user.id,
      username: user.username
    });

    return NextResponse.json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 