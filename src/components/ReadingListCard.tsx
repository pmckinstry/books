'use client';

import Link from 'next/link';
import { ReadingList } from '@/lib/database';

interface ReadingListCardProps {
  readingList: ReadingList;
  onDelete?: (id: number) => void;
}

export default function ReadingListCard({ readingList, onDelete }: ReadingListCardProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reading list?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reading-lists/${readingList.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer dummy-token' // In a real app, use proper JWT
        }
      });

      if (response.ok) {
        onDelete?.(readingList.id);
      } else {
        alert('Failed to delete reading list');
      }
    } catch (error) {
      console.error('Error deleting reading list:', error);
      alert('Failed to delete reading list');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            <Link 
              href={`/reading-lists/${readingList.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              {readingList.name}
            </Link>
          </h3>
          
          {readingList.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {readingList.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(readingList.updated_at).toLocaleDateString()}
            </span>
            
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {readingList.is_public ? 'Public' : 'Private'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Link
            href={`/reading-lists/${readingList.id}/edit`}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Link
          href={`/reading-lists/${readingList.id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View List
        </Link>
        
        <Link
          href={`/reading-lists/${readingList.id}/add-books`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Add Books
        </Link>
      </div>
    </div>
  );
} 