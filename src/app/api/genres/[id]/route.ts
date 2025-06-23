import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getBooksForGenre } from '@/lib/database';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const dbPath = path.join(process.cwd(), 'data', 'books.db');
    const db = new Database(dbPath);
    const genre = db.prepare('SELECT id, name, description FROM genres WHERE id = ?').get(id);
    db.close();
    if (!genre) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    const books = getBooksForGenre(Number(id));
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
    const dbPath = path.join(process.cwd(), 'data', 'books.db');
    const db = new Database(dbPath);
    // Check for duplicate name (excluding current genre)
    const existing = db.prepare('SELECT id FROM genres WHERE name = ? AND id != ?').get(name.trim(), id);
    if (existing) {
      db.close();
      return NextResponse.json({ error: 'Genre name already exists' }, { status: 409 });
    }
    const result = db.prepare('UPDATE genres SET name = ?, description = ? WHERE id = ?').run(name.trim(), description?.trim() || null, id);
    db.close();
    if (result.changes === 0) {
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
    const dbPath = path.join(process.cwd(), 'data', 'books.db');
    const db = new Database(dbPath);
    const result = db.prepare('DELETE FROM genres WHERE id = ?').run(id);
    db.close();
    if (result.changes === 0) {
      return NextResponse.json({ error: 'Genre not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Genre deleted successfully' });
  } catch (error) {
    console.error('Error deleting genre:', error);
    return NextResponse.json({ error: 'Failed to delete genre' }, { status: 500 });
  }
} 