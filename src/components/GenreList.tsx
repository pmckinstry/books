'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GenreSearch from './GenreSearch';
import { Genre } from '@/lib/database-factory';

// Extended Genre type with book count
interface GenreWithCount extends Genre {
  bookCount?: number;
}

export default function GenreList() {
  const [genres, setGenres] = useState<GenreWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await fetch('/api/genres');
      if (!response.ok) {
        throw new Error('Failed to fetch genres');
      }
      const data = await response.json();
      setGenres(data.genres || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSortBy = params.get('sortBy') || 'name';
    const currentSortOrder = params.get('sortOrder') || 'asc';
    
    let newSortOrder: 'asc' | 'desc' = 'asc';
    
    // If clicking the same field, toggle the order
    if (currentSortBy === field) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    params.set('sortBy', field);
    params.set('sortOrder', newSortOrder);
    
    router.push(`/genres?${params.toString()}`);
  };

  const getSortIcon = (field: string) => {
    const currentSortBy = searchParams.get('sortBy') || 'name';
    const currentSortOrder = searchParams.get('sortOrder') || 'asc';
    
    if (currentSortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (currentSortOrder === 'asc') {
      return (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  const filterGenres = (genres: GenreWithCount[]) => {
    const searchTerm = searchParams.get('search') || '';
    
    if (!searchTerm.trim()) {
      return genres;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return genres.filter(genre => 
      genre.name.toLowerCase().includes(term) ||
      (genre.description && genre.description.toLowerCase().includes(term))
    );
  };

  const sortGenres = (genres: GenreWithCount[]) => {
    const currentSortBy = searchParams.get('sortBy') || 'name';
    const currentSortOrder = searchParams.get('sortOrder') || 'asc';
    
    return [...genres].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      // Handle different sort fields
      if (currentSortBy === 'bookCount') {
        aValue = a.bookCount || 0;
        bValue = b.bookCount || 0;
        
        // Numeric comparison for book count
        if (currentSortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      } else {
        // String comparison for other fields
        aValue = a[currentSortBy as keyof Genre] || '';
        bValue = b[currentSortBy as keyof Genre] || '';
        
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (currentSortOrder === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const filteredGenres = filterGenres(genres);
  const sortedGenres = sortGenres(filteredGenres);
  const searchTerm = searchParams.get('search') || '';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Genres</h1>
        <Link
          href="/genres/create"
          className="btn-icon btn-icon-blue"
          aria-label="Create new genre"
          title="Create new genre"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </Link>
      </div>

      <GenreSearch />

      {genres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No genres found</p>
          <Link
            href="/genres/create"
            className="btn-icon btn-icon-blue"
            aria-label="Create your first genre"
            title="Create your first genre"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Link>
        </div>
      ) : sortedGenres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            {searchTerm ? `No genres found matching "${searchTerm}"` : 'No genres found'}
          </p>
          {searchTerm && (
            <button
              onClick={() => router.push('/genres')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md font-medium"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-8">
              <div 
                className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 transition-colors px-2 py-1 rounded"
                onClick={() => handleSort('name')}
              >
                <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Genre Name</span>
                {getSortIcon('name')}
              </div>
              <div 
                className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 transition-colors px-2 py-1 rounded"
                onClick={() => handleSort('bookCount')}
              >
                <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Books</span>
                {getSortIcon('bookCount')}
              </div>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {sortedGenres.map((genre) => (
              <li key={genre.id} className="px-6 py-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-semibold text-gray-900">
                        <Link href={`/genres/${genre.id}`} className="hover:underline">{genre.name}</Link>
                      </h3>

                      {/* Book Count Badge */}
                      <span className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {genre.bookCount || 0} {(genre.bookCount || 0) === 1 ? 'book' : 'books'}
                      </span>
                    </div>
                    {genre.description && (
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {genre.description}
                      </p>
                    )}
                    {!genre.description && (
                      <p className="text-sm text-gray-400 mt-2 italic">
                        No description available
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-3">
                    <Link 
                      href={`/genres/${genre.id}`} 
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                      title="View genre details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/genres/${genre.id}/edit`} 
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Edit genre"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this genre? This action cannot be undone.')) return;
                        try {
                          const response = await fetch(`/api/genres/${genre.id}`, { method: 'DELETE' });
                          if (!response.ok) throw new Error('Failed to delete genre');
                          setGenres(genres.filter(g => g.id !== genre.id));
                        } catch {
                          alert('Failed to delete genre.');
                        }
                      }}
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Delete genre"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-500">
        {searchTerm ? (
          <>
            Showing {sortedGenres.length} of {genres.length} genres
            <span className="ml-2 text-gray-600">(filtered by search)</span>
          </>
        ) : (
          <>
            Total genres: {genres.length} • 
            Total books: {genres.reduce((sum, genre) => sum + (genre.bookCount || 0), 0)}
          </>
        )}
      </div>
    </div>
  );
} 
