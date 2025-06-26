'use client';

import { useState, useEffect } from 'react';
import RecommendationsList from './RecommendationsList';
import TasteDiveRecommendations from './TasteDiveRecommendations';
import GoogleBooksRecommendations from './GoogleBooksRecommendations';

interface Recommendation {
  title: string;
  author: string;
  reason: string;
  genre?: string;
}

interface CombinedRecommendationsProps {
  userId?: number;
  readingListId?: number;
  bookTitle?: string;
  bookAuthor?: string;
}

export default function CombinedRecommendations({ 
  userId, 
  readingListId, 
  bookTitle, 
  bookAuthor 
}: CombinedRecommendationsProps) {
  const [internalRecommendations, setInternalRecommendations] = useState<Recommendation[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'internal' | 'tastedive' | 'google'>('internal');

  useEffect(() => {
    const fetchInternalRecommendations = async () => {
      setInternalLoading(true);
      setInternalError(null);
      
      try {
        let url = '/api/recommendations';
        const headers: Record<string, string> = {};
        
        if (readingListId) {
          url = `/api/recommendations/reading-list/${readingListId}`;
        } else if (userId) {
          headers['Authorization'] = `Bearer ${Buffer.from(JSON.stringify({ userId })).toString('base64')}`;
        }

        const res = await fetch(url, { headers });
        
        if (!res.ok) {
          throw new Error('Failed to fetch internal recommendations');
        }
        
        const data = await res.json();
        setInternalRecommendations(data.recommendations || []);
      } catch (err) {
        setInternalError(err instanceof Error ? err.message : 'An error occurred');
        setInternalRecommendations([]);
      } finally {
        setInternalLoading(false);
      }
    };

    fetchInternalRecommendations();
  }, [userId, readingListId]);

  const hasInternalRecs = internalRecommendations.length > 0;
  const hasExternalRecs = bookTitle && bookTitle.trim() !== '';

  // If no book title is provided, only show internal recommendations
  if (!hasExternalRecs) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Book Recommendations</h2>
        <RecommendationsList
          recommendations={internalRecommendations}
          loading={internalLoading}
          error={internalError}
        />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Book Recommendations</h2>
      
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('internal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'internal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Library Recommendations
              {hasInternalRecs && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {internalRecommendations.length}
                </span>
              )}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('tastedive')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tastedive'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              TasteDive AI
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                AI
              </span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('google')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'google'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              Google Books
              <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Google
              </span>
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'internal' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Based on Your Library</h3>
              <span className="text-xs text-gray-500 bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                Internal Algorithm
              </span>
            </div>
            <RecommendationsList
              recommendations={internalRecommendations}
              loading={internalLoading}
              error={internalError}
            />
          </div>
        )}

        {activeTab === 'tastedive' && (
          <TasteDiveRecommendations
            bookTitle={bookTitle}
            author={bookAuthor}
            maxResults={6}
          />
        )}

        {activeTab === 'google' && (
          <GoogleBooksRecommendations
            bookTitle={bookTitle}
            author={bookAuthor}
            maxResults={6}
          />
        )}
      </div>
    </div>
  );
} 