import { NextRequest, NextResponse } from 'next/server';
import { genreOperations, bookOperations } from '@/lib/database-factory';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const genre = await genreOperations.getById(id);
    
    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    
    // Get books that belong to this genre
    const books = await bookOperations.getBooksByGenre(id);
    
    return NextResponse.json({ genre, books });
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