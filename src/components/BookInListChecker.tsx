'use client';

import { useState, useEffect } from 'react';
import { BookWithGenres } from '@/lib/database';

interface BookInListCheckerProps {
  readingListId: number;
  books: BookWithGenres[];
  onBookStatusChange?: (bookId: number, isInList: boolean) => void;
}

export default function BookInListChecker({ readingListId, books, onBookStatusChange }: BookInListCheckerProps) {
  const [booksInList, setBooksInList] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkBooksInList = async () => {
      if (books.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/reading-lists/${readingListId}`, {
          headers: {
            'Authorization': 'Bearer dummy-token'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const bookIdsInList = new Set<number>(data.readingList.books.map((book: any) => Number(book.id)));
          setBooksInList(bookIdsInList);
          
          // Notify parent component of book status changes
          books.forEach(book => {
            onBookStatusChange?.(book.id, bookIdsInList.has(book.id));
          });
        }
      } catch (error) {
        console.error('Error checking books in list:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBooksInList();
  }, [readingListId, books, onBookStatusChange]);

  const isBookInList = (bookId: number) => {
    return booksInList.has(bookId);
  };

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  return { isBookInList };
} 