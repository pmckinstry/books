'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TasteDiveRecommendation {
  title: string;
  author?: string;
  reason: string;
  genre?: string;
  type: 'book';
  wTeaser?: string;
  wUrl?: string;
  yUrl?: string;
  yID?: string;
}

interface TasteDiveRecommendationsProps {
  bookTitle: string;
  author?: string;
  maxResults?: number;
}

// Helper function to clean title and create search query
const createSearchQuery = (title: string, author?: string): string => {
  // Remove common subtitle indicators and extra text
  let cleanTitle = title
    .replace(/\s*[-–—]\s*.*$/, '') // Remove everything after dash/hyphen
    .replace(/\s*:\s*.*$/, '') // Remove everything after colon
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical text
    .replace(/\s*\[[^\]]*\]/g, '') // Remove bracketed text
    .replace(/\s*By\s+.*$/i, '') // Remove "By Author" suffix
    .replace(/\s*Annotated.*$/i, '') // Remove "Annotated" suffix
    .replace(/\s*Classic.*$/i, '') // Remove "Classic" suffix
    .replace(/\s*Unabridged.*$/i, '') // Remove "Unabridged" suffix
    .replace(/\s*Illustrated.*$/i, '') // Remove "Illustrated" suffix
    .replace(/\s*Original.*$/i, '') // Remove "Original" suffix
    .trim();

  // Combine with author if available
  if (author) {
    return `${cleanTitle} ${author}`;
  }
  
  return cleanTitle;
};

export default function TasteDiveRecommendations({ 
  bookTitle, 
  author, 
  maxResults = 6 
}: TasteDiveRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<TasteDiveRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchTasteDiveRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          title: createSearchQuery(bookTitle, author),
          limit: maxResults.toString()
        });
        
        const res = await fetch(`/api/recommendations/tastedive?${params.toString()}`);
        
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          if (res.status === 404) {
            throw new Error('No recommendations found for this book.');
          }
          throw new Error('Failed to fetch recommendations.');
        }
        
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (bookTitle) {
      fetchTasteDiveRecommendations();
    }
  }, [bookTitle, author, maxResults]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            TasteDive Recommendations
          </h3>
          <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            External API
          </span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Finding similar books...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            TasteDive Recommendations
          </h3>
          <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            External API
          </span>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            TasteDive Recommendations
          </h3>
          <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            External API
          </span>
        </div>
        <div className="text-gray-500 text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          No recommendations found from TasteDive
        </div>
      </div>
    );
  }

  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          TasteDive Recommendations
        </h3>
        <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          External API
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedRecommendations.map((rec, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{rec.title}</h4>
              <p className="text-gray-600 text-sm mb-2">{rec.reason}</p>
              {rec.wTeaser && (
                <p className="text-gray-500 text-xs line-clamp-3 mb-3">{rec.wTeaser}</p>
              )}
              <div className="flex space-x-2">
                <Link 
                  href={`/books?search=${encodeURIComponent(createSearchQuery(rec.title, rec.author))}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Search in Library
                </Link>
                {rec.wUrl && (
                  <a 
                    href={rec.wUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    More Info
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {recommendations.length > 3 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showAll ? 'Show Less' : `Show ${recommendations.length - 3} More`}
          </button>
        </div>
      )}
    </div>
  );
} 