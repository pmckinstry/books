'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Genre {
  id: number;
  name: string;
  description?: string;
}

interface GenreViewProps {
  genreId: string;
}

export default function GenreView({ genreId }: GenreViewProps) {
  const [genre, setGenre] = useState<Genre | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchGenre();
  }, [genreId]);

  const fetchGenre = async () => {
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
  };

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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              ID: {genre.id}
            </span>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Books in this Genre
            </h3>
            {books.length === 0 ? (
              <p className="text-gray-400 italic">No books found for this genre.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {books.map((book) => (
                  <li key={book.id} className="py-2">
                    <a href={`/books/${book.id}`} className="text-blue-700 hover:underline font-medium">
                      {book.title}
                    </a>
                    <span className="ml-2 text-gray-600 text-sm">
                      by <span 
                        className="cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set('search', book.author);
                          window.location.href = `/books?${params.toString()}`;
                        }}
                      >
                        {book.author}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Link
              href={`/genres/${genreId}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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