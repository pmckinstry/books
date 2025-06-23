'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookWithGenres } from "@/lib/database";

interface BookTableProps {
  books: BookWithGenres[];
}

export default function BookTable({ books }: BookTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleRowClick = (bookId: number) => {
    window.location.href = `/books/${bookId}`;
  };

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSortBy = params.get('sortBy') || 'created_at';
    const currentSortOrder = params.get('sortOrder') || 'desc';
    
    let newSortOrder: 'asc' | 'desc' = 'asc';
    
    // If clicking the same field, toggle the order
    if (currentSortBy === field) {
      newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    }
    
    params.set('sortBy', field);
    params.set('sortOrder', newSortOrder);
    params.set('page', '1'); // Reset to first page when sorting changes
    
    router.push(`/books?${params.toString()}`);
  };

  const getSortIcon = (field: string) => {
    const currentSortBy = searchParams.get('sortBy') || 'created_at';
    const currentSortOrder = searchParams.get('sortOrder') || 'desc';
    
    if (currentSortBy !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    if (currentSortOrder === 'asc') {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  {getSortIcon('title')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('author')}
              >
                <div className="flex items-center space-x-1">
                  <span>Author</span>
                  {getSortIcon('author')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('year')}
              >
                <div className="flex items-center space-x-1">
                  <span>Year</span>
                  {getSortIcon('year')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Genres
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50 group">
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" 
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.title}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.author}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex flex-wrap gap-1">
                    {book.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link 
                    href={`/books/${book.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/books/${book.id}/edit`}
                    className="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/books/${book.id}/delete`}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 