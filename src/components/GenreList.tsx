'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import GenreSearch from './GenreSearch';

interface Genre {
  id: number;
  name: string;
  description?: string;
}

export default function GenreList() {
  const [genres, setGenres] = useState<Genre[]>([]);
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
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  const filterGenres = (genres: Genre[]) => {
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

  const sortGenres = (genres: Genre[]) => {
    const currentSortBy = searchParams.get('sortBy') || 'name';
    const currentSortOrder = searchParams.get('sortOrder') || 'asc';
    
    return [...genres].sort((a, b) => {
      let aValue = a[currentSortBy as keyof Genre];
      let bValue = b[currentSortBy as keyof Genre];
      
      // Handle undefined values
      if (aValue === undefined) aValue = '';
      if (bValue === undefined) bValue = '';
      
      // Convert to string for comparison
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (currentSortOrder === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
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
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Create New Genre
        </Link>
      </div>

      <GenreSearch />

      {genres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No genres found</p>
          <Link
            href="/genres/create"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Create your first genre
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
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div 
              className="flex items-center space-x-1 cursor-pointer hover:bg-gray-100 transition-colors px-2 py-1 rounded"
              onClick={() => handleSort('name')}
            >
              <span className="text-sm font-medium text-gray-700 uppercase tracking-wider">Genre Name</span>
              {getSortIcon('name')}
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        ID: {genre.id}
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
                  <div className="ml-4 flex flex-col gap-2 items-end">
                    <Link href={`/genres/${genre.id}`} className="text-blue-600 hover:underline text-sm">View</Link>
                    <Link href={`/genres/${genre.id}/edit`} className="text-yellow-600 hover:underline text-sm">Edit</Link>
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this genre? This action cannot be undone.')) return;
                        try {
                          const response = await fetch(`/api/genres/${genre.id}`, { method: 'DELETE' });
                          if (!response.ok) throw new Error('Failed to delete genre');
                          setGenres(genres.filter(g => g.id !== genre.id));
                        } catch (err) {
                          alert('Failed to delete genre.');
                        }
                      }}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
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
            <span className="ml-2 text-purple-600">(filtered by search)</span>
          </>
        ) : (
          `Total genres: ${genres.length}`
        )}
      </div>
    </div>
  );
} 