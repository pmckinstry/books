'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ReadingList } from '@/lib/database';

interface EditReadingListFormProps {
  readingListId: number;
}

export default function EditReadingListForm({ readingListId }: EditReadingListFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadReadingList = async () => {
      try {
        const response = await fetch(`/api/reading-lists/${readingListId}`, {
          headers: {
            'Authorization': 'Bearer dummy-token'
          }
        });

        if (response.ok) {
          const data = await response.json();
          const readingList = data.readingList;
          
          setName(readingList.name);
          setDescription(readingList.description || '');
          setIsPublic(readingList.is_public);
        } else {
          setError('Failed to load reading list');
        }
      } catch (error) {
        setError('Failed to load reading list');
      } finally {
        setIsLoading(false);
      }
    };

    loadReadingList();
  }, [readingListId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/reading-lists/${readingListId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          is_public: isPublic
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update reading list');
      }

      setSuccessMessage('Reading list updated successfully!');
      
      // Redirect back to the reading list after a short delay
      setTimeout(() => {
        router.push(`/reading-lists/${readingListId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading reading list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Reading List</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {successMessage}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            List Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Summer Reading 2024, Classics to Read, etc."
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your reading list (optional)"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this list public (others can view it)
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Updating...' : 'Update Reading List'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/reading-lists/${readingListId}`)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 