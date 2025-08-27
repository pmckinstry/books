'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BookCoverImage from '@/components/BookCoverImage';
import { BookWithGenres, ReadingListBook } from '@/lib/database-factory';

interface ReadingListBookItemProps {
  book: BookWithGenres & { reading_list_book: ReadingListBook };
  readingListId: string;
}

export default function ReadingListBookItem({ book, readingListId }: ReadingListBookItemProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove "${book.title}" from this reading list?`)) {
      return;
    }

    setIsRemoving(true);
    
    try {
      const response = await fetch(`/api/reading-lists/${readingListId}/books?book_id=${book.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      });

      if (response.ok) {
        // Refresh the page to show updated list
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(`Failed to remove book: ${errorData.error || 'Unknown error'}`);
      }
    } catch {
      alert('Failed to remove book from reading list');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {book.cover_image_url ? (
            <BookCoverImage
              src={book.cover_image_url}
              alt={`Cover of ${book.title}`}
              className="w-16 h-24 object-cover rounded-md shadow-sm"
            />
          ) : (
            <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                <Link 
                  href={`/books/${book.id}`}
                  className="hover:text-blue-600 transition-colors"
                >
                  {book.title}
                </Link>
              </h3>
              <p className="text-gray-600">
                by <span 
                  className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('search', book.author);
                    window.location.href = `/books?${params.toString()}`;
                  }}
                >
                  {book.author}
                </span>
              </p>
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {book.page_count && <span>{book.page_count} pages</span>}
                {book.language && <span>{book.language}</span>}
                {book.isbn && <span>ISBN: {book.isbn}</span>}
              </div>
              
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {book.genres
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((genre) => (
                      <Link
                        key={genre.id}
                        href={`/genres/${genre.id}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {genre.name}
                      </Link>
                    ))}
                </div>
              )}
              
              {book.reading_list_book.notes && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Notes:</strong> {book.reading_list_book.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 font-medium">
                #{book.reading_list_book.position}
              </span>
              <button
                onClick={handleRemove}
                disabled={isRemoving}
                className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                title={isRemoving ? 'Removing...' : 'Remove from reading list'}
              >
                {isRemoving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 