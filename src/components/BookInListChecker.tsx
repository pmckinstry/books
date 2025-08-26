'use client';

import { useState, useEffect } from 'react';
import { BookWithGenres } from '@/lib/database-factory';

interface BookInListCheckerProps {
  readingListId: string;
  books: BookWithGenres[];
  onBookStatusChange?: (bookId: string, isInList: boolean) => void;
}

export default function BookInListChecker({ readingListId, books, onBookStatusChange }: BookInListCheckerProps) {
  const [booksInList, setBooksInList] = useState<Set<string>>(new Set());
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
          const bookIdsInList = new Set<string>(data.readingList.books.map((book: {id: string}) => book.id));
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

  const isBookInList = (bookId: string) => {
    return booksInList.has(bookId);
  };

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  return { isBookInList };
} 