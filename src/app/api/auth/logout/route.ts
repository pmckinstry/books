import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout successful' });
    const isProd = process.env.NODE_ENV === 'production';
    // Clear cookies by setting maxAge to 0
    type CookieSetter = {
      set: (
        name: string,
        value: string,
        options: { httpOnly?: boolean; sameSite?: 'lax' | 'strict' | 'none'; secure?: boolean; path?: string; maxAge?: number }
      ) => void
    }
    type ResponseWithOptionalCookies = NextResponse & { cookies?: CookieSetter }
    const resWithCookies = response as ResponseWithOptionalCookies
    resWithCookies.cookies?.set('user-id', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 0
    });
    resWithCookies.cookies?.set('csrf-token', '', {
      httpOnly: false,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 0
    });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
