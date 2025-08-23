import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 