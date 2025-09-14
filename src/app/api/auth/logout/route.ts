import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'Logout successful' });
    const isProd = process.env.NODE_ENV === 'production';
    // Clear cookies by setting maxAge to 0
    response.cookies.set('user-id', '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      path: '/',
      maxAge: 0
    });
    response.cookies.set('csrf-token', '', {
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
