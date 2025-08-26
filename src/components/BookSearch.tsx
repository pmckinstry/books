'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BookAdvancedFilters from './BookAdvancedFilters';
import { Genre } from '@/lib/database-factory';

interface BookSearchProps {
  genres?: Genre[];
}

export default function BookSearch({ genres = [] }: BookSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Update search term when URL params change
  useEffect(() => {
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    const params = new URLSearchParams(searchParams);
    
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    
    // Reset to first page when searching
    params.set('page', '1');
    
    router.push(`/books?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    const params = new URLSearchParams(searchParams);
    params.delete('search');
    params.set('page', '1');
    router.push(`/books?${params.toString()}`);
  };

  // Check if any advanced filters are active
  const hasAdvancedFilters = ['yearFrom', 'yearTo', 'language', 'publisher', 'pageCountFrom', 'pageCountTo', 'genreIds'].some(param => 
    searchParams.get(param)
  );

  return (
    <div className="mb-6 space-y-4">
      {/* Main search bar */}
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search books by title, author, year, genre, or description..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-3 border rounded-md transition-colors flex items-center space-x-2 ${
            hasAdvancedFilters || showAdvancedFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filters</span>
          {hasAdvancedFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 ml-1">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Search status */}
      {searchTerm && (
        <p className="text-sm text-gray-600">
          Searching for: <span className="font-medium">&quot;{searchTerm}&quot;</span>
        </p>
      )}

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mt-4">
          <BookAdvancedFilters 
            genres={genres} 
            onClose={() => setShowAdvancedFilters(false)} 
          />
        </div>
      )}
    </div>
  );
} 