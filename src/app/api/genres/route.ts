import { NextRequest, NextResponse } from 'next/server';
import { genreOperations, bookOperations } from '@/lib/database';

export async function GET() {
  try {
    const genres = await genreOperations.getAll();
    
    // Get book counts for each genre
    const genresWithCounts = await Promise.all(
      genres.map(async (genre) => {
        try {
          const books = await bookOperations.getBooksByGenre(genre.id);
          return {
            ...genre,
            bookCount: books.length
          };
        } catch (error) {
          console.error(`Error getting book count for genre ${genre.id}:`, error);
          return {
            ...genre,
            bookCount: 0
          };
        }
      })
    );
    
    return NextResponse.json({ genres: genresWithCounts });
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
    const existingGenre = await genreOperations.checkDuplicate(name);
    if (existingGenre) {
      return NextResponse.json({ error: 'Genre already exists' }, { status: 409 });
    }

    // Create new genre
    const newGenre = await genreOperations.create({ name, description });

    return NextResponse.json({ 
      message: 'Genre created successfully',
      id: newGenre.id 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating genre:', error);
    return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 });
  }
} 
