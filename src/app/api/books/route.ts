import { NextRequest, NextResponse } from 'next/server';
import { bookOperations, CreateBookData } from '@/lib/database';

// GET /api/books - Get all books
export async function GET() {
  try {
    const books = bookOperations.getAll();
    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author, year, description } = body;

    // Validate required fields
    if (!title || !author || !year) {
      return NextResponse.json(
        { error: 'Title, author, and year are required' },
        { status: 400 }
      );
    }

    // Validate year is a number
    if (typeof year !== 'number' || year < 1000 || year > new Date().getFullYear() + 10) {
      return NextResponse.json(
        { error: 'Year must be a valid number between 1000 and current year + 10' },
        { status: 400 }
      );
    }

    const bookData: CreateBookData = {
      title: title.trim(),
      author: author.trim(),
      year,
      description: description?.trim()
    };

    const newBook = bookOperations.create(bookData);
    return NextResponse.json(newBook, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
} 