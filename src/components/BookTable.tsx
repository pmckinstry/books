'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookWithGenres } from "@/lib/database-factory";

interface BookTableProps {
  books: BookWithGenres[];
  baseUrl?: string;
}

export default function BookTable({ books, baseUrl = '/books' }: BookTableProps) {
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
    
    router.push(`${baseUrl}?${params.toString()}`);
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
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-x-auto">
      <div>
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
                onClick={() => handleSort('isbn')}
              >
                <div className="flex items-center space-x-1">
                  <span>ISBN</span>
                  {getSortIcon('isbn')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('page_count')}
              >
                <div className="flex items-center space-x-1">
                  <span>Pages</span>
                  {getSortIcon('page_count')}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('language')}
              >
                <div className="flex items-center space-x-1">
                  <span>Language</span>
                  {getSortIcon('language')}
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
                  className="px-6 py-4 text-sm font-medium text-gray-900 cursor-pointer whitespace-normal break-words max-w-[40ch]" 
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.title}
                </td>
                <td 
                  className="px-6 py-4 text-sm text-gray-500 cursor-pointer whitespace-normal break-words max-w-[28ch]"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('search', book.author);
                    router.push(`/books?${params.toString()}`);
                  }}
                >
                  {book.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.isbn}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.page_count}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {book.language}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-normal">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(book.genres) && book.genres
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((genre) => (
                        <Link
                          key={genre.id}
                          href={`/genres/${genre.id}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {genre.name}
                        </Link>
                      ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <Link 
                      href={`/books/${book.id}`}
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                      title="View book details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/books/${book.id}/edit`}
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Edit book"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <Link 
                      href={`/books/${book.id}/delete`}
                      className="text-gray-600 hover:text-gray-800 transition-colors p-1 rounded hover:bg-gray-100"
                      title="Delete book"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
