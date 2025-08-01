import { NextRequest, NextResponse } from 'next/server';
import { bookOperations, UpdateBookData } from '@/lib/database';

// GET /api/books/[id] - Get a single book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = bookOperations.getById(id);
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

// PUT /api/books/[id] - Update a book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      author, 
      description, 
      isbn, 
      page_count, 
      language, 
      publisher, 
      cover_image_url, 
      publication_date,
      genres
    } = body;

    // Validate ISBN format if provided
    if (isbn !== undefined && isbn && !/^(?:\d{10}|\d{13})$/.test(isbn.replace(/[-\s]/g, ''))) {
      return NextResponse.json(
        { error: 'ISBN must be a valid 10 or 13 digit number' },
        { status: 400 }
      );
    }

    // Validate page count if provided
    if (page_count !== undefined && page_count && (typeof page_count !== 'number' || page_count < 1)) {
      return NextResponse.json(
        { error: 'Page count must be a positive number' },
        { status: 400 }
      );
    }

    // Validate publication date if provided
    if (publication_date !== undefined && publication_date && !/^\d{4}-\d{2}-\d{2}$/.test(publication_date)) {
      return NextResponse.json(
        { error: 'Publication date must be in YYYY-MM-DD format' },
        { status: 400 }
      );
    }

    const updateData: UpdateBookData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (author !== undefined) updateData.author = author.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isbn !== undefined) updateData.isbn = isbn.trim();
    if (page_count !== undefined) updateData.page_count = page_count;
    if (language !== undefined) updateData.language = language.trim();
    if (publisher !== undefined) updateData.publisher = publisher.trim();
    if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url.trim();
    if (publication_date !== undefined) updateData.publication_date = publication_date.trim();
    if (genres !== undefined) updateData.genres = genres;

    // Get current book for duplicate check
    const currentBook = bookOperations.getById(id);
    if (!currentBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    // Check for duplicate book if title or author is being updated
    if ((title !== undefined && title !== currentBook.title) || (author !== undefined && author !== currentBook.author)) {
      const newTitle = title !== undefined ? title : currentBook.title;
      const newAuthor = author !== undefined ? author : currentBook.author;
      
      const existingBook = bookOperations.checkDuplicate(newTitle, newAuthor, id);
      if (existingBook) {
        return NextResponse.json(
          { 
            error: `A book with the title "${existingBook.title}" by "${existingBook.author}" already exists.`,
            existingBook: {
              id: existingBook.id,
              title: existingBook.title,
              author: existingBook.author
            }
          },
          { status: 409 }
        );
      }
    }

    const updatedBook = bookOperations.update(id, updateData);
    if (!updatedBook) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error('Error updating book:', error);
    return NextResponse.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

// DELETE /api/books/[id] - Delete a book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const success = bookOperations.delete(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return NextResponse.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
} 