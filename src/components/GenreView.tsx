'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Genre, BookWithGenres } from '@/lib/database-factory';
import BookTable from '@/components/BookTable';

interface GenreViewProps {
  genreId: string;
}

export default function GenreView({ genreId }: GenreViewProps) {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [books, setBooks] = useState<BookWithGenres[]>([]);
  const router = useRouter();

  const fetchGenre = useCallback(async () => {
    try {
      const response = await fetch(`/api/genres/${genreId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch genre');
      }
      const data = await response.json();
      setGenre(data.genre);
      setBooks(data.books || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load genre');
    } finally {
      setIsLoading(false);
    }
  }, [genreId]);

  useEffect(() => {
    fetchGenre();
  }, [fetchGenre]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this genre? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/genres/${genreId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete genre');
      }

      // Redirect to genres page after successful deletion
      router.push('/genres');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !genre) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <div className="mt-4">
          <Link
            href="/genres"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Genres
          </Link>
        </div>
      </div>
    );
  }

  if (!genre) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Genre not found
        </div>
        <div className="mt-4">
          <Link
            href="/genres"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Genres
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Genre Details
        </h1>
        <Link 
          href="/genres"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Genres
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {genre.name}
            </h2>

          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Description
            </h3>
            {genre.description ? (
              <p className="text-gray-700 leading-relaxed">
                {genre.description}
              </p>
            ) : (
              <p className="text-gray-400 italic">
                No description available
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 flex items-center">
              Books in this Genre
              <span className="ml-2 flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {books.length} {books.length === 1 ? 'book' : 'books'}
              </span>
            </h3>
            {books.length === 0 ? (
              <p className="text-gray-400 italic">No books found for this genre.</p>
            ) : (
              <BookTable books={books} baseUrl={`/genres/${genreId}`} />
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              href={`/genres/${genreId}/edit`}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md font-medium"
            >
              Edit Genre
            </Link>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete Genre'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 