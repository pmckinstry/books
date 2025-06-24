'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface BookSortingProps {
  currentSortBy: string;
  currentSortOrder: 'asc' | 'desc';
}

export default function BookSorting({ currentSortBy, currentSortOrder }: BookSortingProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    // Reset to first page when sorting changes
    params.set('page', '1');
    router.push(`/books?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-4 mb-6">
      <label className="text-sm font-medium text-gray-700">Sort by:</label>
      
      <select
        value={currentSortBy}
        onChange={(e) => handleSortChange(e.target.value, currentSortOrder)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="title">Title</option>
        <option value="author">Author</option>
        <option value="year">Year</option>
        <option value="isbn">ISBN</option>
        <option value="page_count">Pages</option>
        <option value="language">Language</option>
        <option value="created_at">Date Added</option>
      </select>

      <select
        value={currentSortOrder}
        onChange={(e) => handleSortChange(currentSortBy, e.target.value as 'asc' | 'desc')}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
    </div>
  );
} 