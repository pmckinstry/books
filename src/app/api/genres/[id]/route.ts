import { NextRequest, NextResponse } from 'next/server';
import { genreOperations, bookOperations } from '@/lib/database';

const compareStrings = (a: string | null | undefined, b: string | null | undefined) => {
  const left = (a ?? '').toLowerCase();
  const right = (b ?? '').toLowerCase();
  return left.localeCompare(right);
};

const compareNumbers = (a: number | null | undefined, b: number | null | undefined) => {
  const left = typeof a === 'number' ? a : 0;
  const right = typeof b === 'number' ? b : 0;
  return left - right;
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const genre = await genreOperations.getById(id);
    
    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'title';
    const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc';

    // Get books that belong to this genre
    const books = await bookOperations.getBooksByGenre(id);
    const sortedBooks = [...books].sort((a, b) => {
      const direction = sortOrder === 'desc' ? -1 : 1;
      switch (sortBy) {
        case 'author':
          return compareStrings(a.author, b.author) * direction;
        case 'isbn':
          return compareStrings(a.isbn, b.isbn) * direction;
        case 'page_count':
          return compareNumbers(a.page_count as number | null | undefined, b.page_count as number | null | undefined) * direction;
        case 'language':
          return compareStrings(a.language, b.language) * direction;
        case 'title':
        default:
          return compareStrings(a.title, b.title) * direction;
      }
    });
    
    return NextResponse.json({ genre, books: sortedBooks });
  } catch (error) {
    console.error('Error fetching genre:', error);
    return NextResponse.json({ error: 'Failed to fetch genre' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, description } = await request.json();
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Genre name is required' }, { status: 400 });
    }
    
    // Check for duplicate name (excluding current genre)
    const existing = await genreOperations.checkDuplicate(name);
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: 'Genre name already exists' }, { status: 409 });
    }
    
    const updatedGenre = await genreOperations.update(id, { name, description });
    if (!updatedGenre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Genre updated successfully' });
  } catch (error) {
    console.error('Error updating genre:', error);
    return NextResponse.json({ error: 'Failed to update genre' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await genreOperations.delete(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json({ error: 'Failed to delete genre' }, { status: 500 });
  }
} 
