'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Book } from '@/lib/database';

interface DeleteBookFormProps {
  bookId: string;
}

export default function DeleteBookForm({ bookId }: DeleteBookFormProps) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await api.getBook(parseInt(bookId));
        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book:', error);
        setError('Failed to load book');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await api.deleteBook(parseInt(bookId));
      router.push('/books');
      router.refresh();
    } catch (error) {
      console.error('Error deleting book:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete book');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Book Not Found
          </h1>
          <p className="text-gray-600 mb-4">{error || 'The book you are looking for does not exist.'}</p>
          <Link 
            href="/books"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Delete Book
        </h1>
        <Link 
          href={`/books/${book.id}`}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Book
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center space-y-6">
          <div className="text-red-600">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Are you sure you want to delete this book?
            </h2>
            <p className="text-gray-600">
              This action cannot be undone. The book "{book.title}" by {book.author} will be permanently removed.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Book Details:</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              {book.description && (
                <p><strong>Description:</strong> {book.description}</p>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Delete Book'}
            </button>
            <Link
              href={`/books/${book.id}`}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 