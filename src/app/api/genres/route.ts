import { NextRequest, NextResponse } from 'next/server';
import { genreOperations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const genres = genreOperations.getAll();
    return NextResponse.json({ genres });
  } catch (error) {
    console.error('Error fetching genres:', error);
    return NextResponse.json({ genres: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Genre name is required' }, { status: 400 });
    }

    // Check if genre already exists
    const existingGenre = genreOperations.checkDuplicate(name);
    if (existingGenre) {
      return NextResponse.json({ error: 'Genre already exists' }, { status: 409 });
    }

    // Create new genre
    const newGenre = genreOperations.create({ name, description });

    return NextResponse.json({ 
      message: 'Genre created successfully',
      id: newGenre.id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating genre:', error);
    return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 });
  }
} 