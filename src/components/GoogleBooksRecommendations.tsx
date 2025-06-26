'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface GoogleBooksRecommendation {
  title: string;
  author?: string;
  reason: string;
  genre?: string;
  type: 'book';
  description?: string;
  imageUrl?: string;
  previewLink?: string;
  publishedDate?: string;
  pageCount?: number;
  averageRating?: number;
  ratingsCount?: number;
}

interface GoogleBooksRecommendationsProps {
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

export default function GoogleBooksRecommendations({ 
  bookTitle, 
  author, 
  maxResults = 6 
}: GoogleBooksRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<GoogleBooksRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchGoogleBooksRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          title: bookTitle,
          limit: maxResults.toString()
        });
        
        if (author) {
          params.append('author', author);
        }

        const res = await fetch(`/api/recommendations/google-books?${params.toString()}`);
        
        if (!res.ok) {
          if (res.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
          if (res.status === 403) {
            throw new Error('Google Books API quota exceeded.');
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
      fetchGoogleBooksRecommendations();
    }
  }, [bookTitle, author, maxResults]);

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#e5e7eb" />
            </linearGradient>
          </defs>
          <path fill="url(#halfStar)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return <div className="flex items-center">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            Google Books Recommendations
          </h3>
          <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Google API
          </span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-gray-600">Searching Google Books...</span>
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
            Google Books Recommendations
          </h3>
          <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Google API
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
            Google Books Recommendations
          </h3>
          <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Google API
          </span>
        </div>
        <div className="text-gray-500 text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          No recommendations found from Google Books
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
          Google Books Recommendations
        </h3>
        <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          Google API
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedRecommendations.map((rec, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex space-x-3">
              {/* Book Cover */}
              <div className="flex-shrink-0">
                {rec.imageUrl ? (
                  <img
                    src={rec.imageUrl}
                    alt={`Cover of ${rec.title}`}
                    width={60}
                    height={80}
                    className="rounded shadow-sm object-cover"
                    onError={(e) => {
                      // Hide broken images
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-15 h-20 bg-gray-200 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">{rec.title}</h4>
                {rec.author && (
                  <p className="text-gray-600 text-xs mb-1">by {rec.author}</p>
                )}
                <p className="text-gray-500 text-xs mb-2">{rec.reason}</p>
                
                {/* Rating */}
                {rec.averageRating && (
                  <div className="flex items-center space-x-1 mb-2">
                    {renderStars(rec.averageRating)}
                    <span className="text-xs text-gray-500">({rec.ratingsCount?.toLocaleString() || 0})</span>
                  </div>
                )}
                
                {/* Metadata */}
                <div className="flex items-center space-x-2 text-xs text-gray-500 mb-3">
                  {rec.publishedDate && (
                    <span>{new Date(rec.publishedDate).getFullYear()}</span>
                  )}
                  {rec.pageCount && (
                    <span>{rec.pageCount} pages</span>
                  )}
                  {rec.genre && (
                    <span className="bg-gray-100 px-2 py-1 rounded">{rec.genre}</span>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex space-x-2">
                  <Link 
                    href={`/books?search=${encodeURIComponent(createSearchQuery(rec.title, rec.author))}`}
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                  >
                    Search in Library
                  </Link>
                  {rec.previewLink && (
                    <a 
                      href={rec.previewLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700 text-xs"
                    >
                      Preview
                    </a>
                  )}
                </div>
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