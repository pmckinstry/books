'use client';

import { useState, useEffect } from 'react';
import { getCurrentUserId } from '@/lib/auth';
import { UserBookAssociation as DBUserBookAssociation } from '@/lib/database';

interface UserBookAssociationProps {
  bookId: number;
  initialAssociation?: DBUserBookAssociation | null;
}

export default function UserBookAssociation({ bookId, initialAssociation }: UserBookAssociationProps) {
  const [association, setAssociation] = useState<DBUserBookAssociation | null>(null);
  const [readStatus, setReadStatus] = useState<'unread' | 'reading' | 'read'>('unread');
  const [rating, setRating] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID on client side only to avoid hydration mismatch
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
  }, []);

  // Fetch initial association on client side
  useEffect(() => {
    const fetchInitialAssociation = async () => {
      if (!userId) {
        setIsInitialized(true);
        return;
      }

      try {
        const response = await fetch(`/api/user-books/${bookId}?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setAssociation(data);
          setReadStatus(data.read_status || 'unread');
          setRating(data.rating || 0);
          setComments(data.comments || '');
        }
      } catch (error) {
        console.error('Error fetching initial association:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    if (userId !== null) {
      fetchInitialAssociation();
    }
  }, [bookId, userId]);

  const handleSave = async () => {
    if (!userId) {
      setMessage('Please log in to save your reading progress');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user-books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          book_id: bookId,
          read_status: readStatus,
          rating: rating > 0 ? rating : undefined,
          comments: comments.trim() || undefined,
        }),
      });

      if (response.ok) {
        const savedAssociation = await response.json();
        setAssociation(savedAssociation);
        setMessage('Reading progress saved successfully!');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to save reading progress');
      }
    } catch (error) {
      console.error('Error saving reading progress:', error);
      setMessage('Failed to save reading progress');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || !association) {
      setMessage('No association to delete');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/user-books/${bookId}?userId=${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssociation(null);
        setReadStatus('unread');
        setRating(0);
        setComments('');
        setMessage('Reading progress deleted successfully!');
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to delete reading progress');
      }
    } catch (error) {
      console.error('Error deleting reading progress:', error);
      setMessage('Failed to delete reading progress');
    } finally {
      setIsLoading(false);
    }
  };

  // Always render the same initial structure to avoid hydration mismatch
  // Show loading state until we determine if user is logged in
  if (userId === null) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please log in to track your reading progress for this book.</p>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">My Reading Progress</h3>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('successfully') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-4">
        {/* Reading Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reading Status
          </label>
          <select
            value={readStatus}
            onChange={(e) => setReadStatus(e.target.value as 'unread' | 'reading' | 'read')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="unread">Unread</option>
            <option value="reading">Currently Reading</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
                } hover:text-yellow-400 transition-colors`}
              >
                ★
              </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">
              {rating > 0 ? `${rating}/5` : 'No rating'}
            </span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add your thoughts about this book..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving...' : 'Save Progress'}
          </button>
          
          {association && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 