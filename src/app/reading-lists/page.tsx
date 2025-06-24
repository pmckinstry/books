'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReadingList } from '@/lib/database';
import ReadingListCard from '@/components/ReadingListCard';
import AuthGuard from '@/components/AuthGuard';

export default function ReadingListsPage() {
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [publicLists, setPublicLists] = useState<ReadingList[]>([]);
  const [activeTab, setActiveTab] = useState<'user' | 'public'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReadingLists = async (type: 'user' | 'public') => {
    try {
      const response = await fetch(`/api/reading-lists?type=${type}`, {
        headers: {
          'Authorization': 'Bearer dummy-token' // In a real app, use proper JWT
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reading lists');
      }

      const data = await response.json();
      return data.readingLists;
    } catch (error) {
      console.error('Error fetching reading lists:', error);
      throw error;
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [userLists, publicListsData] = await Promise.all([
        fetchReadingLists('user'),
        fetchReadingLists('public')
      ]);

      setReadingLists(userLists);
      setPublicLists(publicListsData);
    } catch (error) {
      setError('Failed to load reading lists');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (deletedId: number) => {
    setReadingLists(prev => prev.filter(list => list.id !== deletedId));
  };

  if (isLoading) {
    return (
      <AuthGuard>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Loading reading lists...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reading Lists</h1>
            <p className="text-gray-600 mt-2">
              Organize your books into themed reading lists
            </p>
          </div>
          <Link 
            href="/reading-lists/create"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New List
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('user')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'user'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Lists ({readingLists.length})
            </button>
            <button
              onClick={() => setActiveTab('public')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'public'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Public Lists ({publicLists.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'user' ? (
          <div>
            {readingLists.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reading lists yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first reading list to organize your books by theme, mood, or reading goals.
                </p>
                <Link
                  href="/reading-lists/create"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Your First List
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readingLists.map((readingList) => (
                  <ReadingListCard
                    key={readingList.id}
                    readingList={readingList}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {publicLists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No public reading lists available.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicLists.map((readingList) => (
                  <ReadingListCard
                    key={readingList.id}
                    readingList={readingList}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 