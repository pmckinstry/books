'use client';

import { useState } from 'react';
import ReadingListBookItem from '@/components/ReadingListBookItem';
import { BookWithGenres, ReadingListBook } from '@/lib/database-factory';

interface ReadingListBooksProps {
  initialBooks: (BookWithGenres & { reading_list_book: ReadingListBook })[];
  readingListId: string;
}

export default function ReadingListBooks({ initialBooks, readingListId }: ReadingListBooksProps) {
  const [books, setBooks] = useState(initialBooks);
  const [isSaving, setIsSaving] = useState(false);

  const reorder = async (newBooks: (BookWithGenres & { reading_list_book: ReadingListBook })[]) => {
    setBooks(newBooks.map((b, idx) => ({
      ...b,
      reading_list_book: { ...b.reading_list_book, position: idx + 1 }
    })));

    try {
      setIsSaving(true);
      await fetch(`/api/reading-lists/${readingListId}/books/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({ book_ids: newBooks.map(b => b.id) })
      });
    } catch (error) {
      console.error('Failed to reorder books:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const moveBook = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= books.length) return;

    const newBooks = [...books];
    [newBooks[index], newBooks[targetIndex]] = [newBooks[targetIndex], newBooks[index]];
    reorder(newBooks);
  };

  return (
    <div className="divide-y divide-gray-200">
      {books.map((book, index) => (
        <ReadingListBookItem
          key={book.reading_list_book.id}
          book={book}
          readingListId={readingListId}
          onMoveUp={() => moveBook(index, 'up')}
          onMoveDown={() => moveBook(index, 'down')}
          disableUp={index === 0 || isSaving}
          disableDown={index === books.length - 1 || isSaving}
        />
      ))}
    </div>
  );
}
