import { NextRequest, NextResponse } from 'next/server';
import { userOperations } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

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

    // Set user-id cookie (HttpOnly) and csrf-token cookie (readable for double-submit)
    const response = NextResponse.json({
      message: 'Login successful',
      user
    });

    const isProd = process.env.NODE_ENV === 'production';
    const oneWeek = 7 * 24 * 60 * 60; // seconds
    const csrfToken = uuidv4();

    // In tests, NextResponse may be mocked without cookies API
    type CookieSetter = {
      set: (
        name: string,
        value: string,
        options: { httpOnly?: boolean; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean; path?: string; maxAge?: number }
      ) => void
    }
    type ResponseWithOptionalCookies = NextResponse & { cookies?: CookieSetter }
    const resWithCookies = response as ResponseWithOptionalCookies
    resWithCookies.cookies?.set('user-id', String(user.id), {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: oneWeek
    });
    resWithCookies.cookies?.set('csrf-token', csrfToken, {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: oneWeek
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
