'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Genre } from '@/lib/database-factory';

interface BookAdvancedFiltersProps {
  genres: Genre[];
  onClose?: () => void;
}

export default function BookAdvancedFilters({ genres, onClose }: BookAdvancedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for all filters
  const [yearFrom, setYearFrom] = useState(searchParams.get('yearFrom') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('yearTo') || '');
  const [language, setLanguage] = useState(searchParams.get('language') || '');
  const [publisher, setPublisher] = useState(searchParams.get('publisher') || '');
  const [pageCountFrom, setPageCountFrom] = useState(searchParams.get('pageCountFrom') || '');
  const [pageCountTo, setPageCountTo] = useState(searchParams.get('pageCountTo') || '');
  const [selectedGenres, setSelectedGenres] = useState<number[]>(() => {
    const genreIds = searchParams.get('genreIds');
    return genreIds ? genreIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
  });

  // Common languages for quick selection
  const commonLanguages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Russian', 'Japanese', 'Chinese', 'Korean', 'Arabic', 'Dutch'
  ];

  // Update state when URL params change
  useEffect(() => {
    setYearFrom(searchParams.get('yearFrom') || '');
    setYearTo(searchParams.get('yearTo') || '');
    setLanguage(searchParams.get('language') || '');
    setPublisher(searchParams.get('publisher') || '');
    setPageCountFrom(searchParams.get('pageCountFrom') || '');
    setPageCountTo(searchParams.get('pageCountTo') || '');
    
    const genreIds = searchParams.get('genreIds');
    setSelectedGenres(genreIds ? genreIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []);
  }, [searchParams]);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev => {
      if (prev.includes(genreId)) {
        return prev.filter(id => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Clear existing filter params
    ['yearFrom', 'yearTo', 'language', 'publisher', 'pageCountFrom', 'pageCountTo', 'genreIds'].forEach(key => {
      params.delete(key);
    });

    // Add new filter params
    if (yearFrom.trim()) params.set('yearFrom', yearFrom.trim());
    if (yearTo.trim()) params.set('yearTo', yearTo.trim());
    if (language.trim()) params.set('language', language.trim());
    if (publisher.trim()) params.set('publisher', publisher.trim());
    if (pageCountFrom.trim()) params.set('pageCountFrom', pageCountFrom.trim());
    if (pageCountTo.trim()) params.set('pageCountTo', pageCountTo.trim());
    if (selectedGenres.length > 0) params.set('genreIds', selectedGenres.join(','));

    // Reset to first page
    params.set('page', '1');

    router.push(`/books?${params.toString()}`);
    onClose?.();
  };

  const clearFilters = () => {
    setYearFrom('');
    setYearTo('');
    setLanguage('');
    setPublisher('');
    setPageCountFrom('');
    setPageCountTo('');
    setSelectedGenres([]);

    // Clear URL params but keep search and sorting
    const params = new URLSearchParams(searchParams);
    ['yearFrom', 'yearTo', 'language', 'publisher', 'pageCountFrom', 'pageCountTo', 'genreIds'].forEach(key => {
      params.delete(key);
    });
    params.set('page', '1');

    router.push(`/books?${params.toString()}`);
    onClose?.();
  };

  const hasActiveFilters = yearFrom || yearTo || language || publisher || pageCountFrom || pageCountTo || selectedGenres.length > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publication Year Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Publication Year</label>
          <div className="flex space-x-2 items-center">
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              placeholder="From"
              min="1000"
              max={new Date().getFullYear()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              placeholder="To"
              min="1000"
              max={new Date().getFullYear()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Language</label>
          <div className="space-y-2">
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Enter language..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex flex-wrap gap-1">
              {commonLanguages.map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-xs rounded ${
                    language === lang 
                      ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Publisher */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Publisher</label>
          <input
            type="text"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            placeholder="Search publisher..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Page Count Range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Page Count</label>
          <div className="flex space-x-2 items-center">
            <input
              type="number"
              value={pageCountFrom}
              onChange={(e) => setPageCountFrom(e.target.value)}
              placeholder="From"
              min="1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <input
              type="number"
              value={pageCountTo}
              onChange={(e) => setPageCountTo(e.target.value)}
              placeholder="To"
              min="1"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Genres */}
      <div className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">Genres</label>
        <div className="flex flex-wrap gap-2">
          {Array.isArray(genres) && genres
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreToggle(genre.id)}
                className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                  selectedGenres.includes(genre.id)
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {genre.name}
              </button>
            ))}
        </div>
        {selectedGenres.length > 0 && (
          <p className="text-sm text-gray-600">
            {selectedGenres.length} genre{selectedGenres.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Clear Filters
        </button>
        <div className="flex space-x-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
          )}
          <button
            onClick={applyFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            Active filters: 
            {yearFrom && ` Year from ${yearFrom}`}
            {yearTo && ` Year to ${yearTo}`}
            {language && ` Language: ${language}`}
            {publisher && ` Publisher: ${publisher}`}
            {pageCountFrom && ` Pages from ${pageCountFrom}`}
            {pageCountTo && ` Pages to ${pageCountTo}`}
            {selectedGenres.length > 0 && ` ${selectedGenres.length} genre(s)`}
          </p>
        </div>
      )}
    </div>
  );
}