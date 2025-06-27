import { NextRequest, NextResponse } from 'next/server';
import { genreOperations } from '@/lib/database';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const genre = genreOperations.getById(Number(id));
    
    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    
    const books = genreOperations.getBooks(Number(id));
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
    const existing = genreOperations.checkDuplicate(name, Number(id));
    if (existing) {
      return NextResponse.json({ error: 'Genre name already exists' }, { status: 409 });
    }
    
    const updatedGenre = genreOperations.update(Number(id), { name, description });
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
    const success = genreOperations.delete(Number(id));
    
    if (!success) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json({ error: 'Failed to delete genre' }, { status: 500 });
  }
} 