import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const dbPath = path.join(process.cwd(), 'data', 'books.db');
    const db = new Database(dbPath);
    const genres = db.prepare('SELECT id, name, description FROM genres ORDER BY name').all();
    db.close();
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

    const dbPath = path.join(process.cwd(), 'data', 'books.db');
    const db = new Database(dbPath);

    // Check if genre already exists
    const existingGenre = db.prepare('SELECT id FROM genres WHERE name = ?').get(name.trim());
    if (existingGenre) {
      db.close();
      return NextResponse.json({ error: 'Genre already exists' }, { status: 409 });
    }

    // Insert new genre
    const result = db.prepare(
      'INSERT INTO genres (name, description) VALUES (?, ?)'
    ).run(name.trim(), description?.trim() || null);

    db.close();

    return NextResponse.json({ 
      message: 'Genre created successfully',
      id: result.lastInsertRowid 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating genre:', error);
    return NextResponse.json({ error: 'Failed to create genre' }, { status: 500 });
  }
} 