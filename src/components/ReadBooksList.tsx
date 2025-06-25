'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import RecommendationsList from './RecommendationsList';

interface Book {
  id: number;
  title: string;
  author: string;
  description?: string;
  genres: Array<{ id: number; name: string; description?: string }>;
  user_association?: {
    id: number;
    user_id: number;
    book_id: number;
    read_status: string;
    rating?: number;
    comments?: string;
    created_at: string;
    updated_at: string;
  };
}

export default function ReadBooksList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(true);
  const [recError, setRecError] = useState<string | null>(null);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  useEffect(() => {
    fetchReadBooks();
  }, [currentPage, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setRecLoading(true);
      try {
        // Get current user to include user ID in request
        const currentUser = getCurrentUser();
        if (!currentUser) {
          setRecError('User not authenticated');
          setRecommendations([]);
          return;
        }

        const res = await fetch('/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${Buffer.from(JSON.stringify({ userId: currentUser.id })).toString('base64')}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setRecError(null);
      } catch (err) {
        setRecError(err instanceof Error ? err.message : 'An error occurred');
        setRecommendations([]);
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  const fetchReadBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm })
      });

      // Get current user to include user ID in request
      const currentUser = getCurrentUser();
      if (!currentUser) {
        setError('User not authenticated');
        setBooks([]);
        return;
      }

      const response = await fetch(`/api/user-books/read?${params}`, {
        headers: {
          'Authorization': `Bearer ${Buffer.from(JSON.stringify({ userId: currentUser.id })).toString('base64')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch read books');
      }

      const data = await response.json();
      setBooks(data.books);
      setTotalPages(data.totalPages);
      setTotalBooks(data.total);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (currentPage > 1) params.set('page', '1');
    router.push(`/read?${params.toString()}`);
  };

  const handleSort = (field: string) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortBy(field);
    setSortOrder(newOrder);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (newPage > 1) params.set('page', newPage.toString());
    router.push(`/read?${params.toString()}`);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
          >
            ★
          </span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your read books...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Books I've Read</h1>
          <p className="mt-2 text-gray-600">
            Your personal reading history ({totalBooks} books)
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title or author..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Books Table */}
        {books.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No read books found matching your search.' : "You haven't marked any books as read yet."}
            </p>
            {!searchTerm && (
              <Link
                href="/books"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Browse All Books
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('title')}
                    >
                      Title
                      {sortBy === 'title' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('author')}
                    >
                      Author
                      {sortBy === 'author' && (
                        <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Genres
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {books.map((book) => (
                    <tr 
                      key={book.id} 
                      className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => router.push(`/books/${book.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {book.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div 
                          className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const params = new URLSearchParams();
                            params.set('search', book.author);
                            router.push(`/books?${params.toString()}`);
                          }}
                        >
                          {book.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {book.genres.map((genre) => (
                            <Link
                              key={genre.id}
                              href={`/genres/${genre.id}`}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {genre.name}
                            </Link>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(book.user_association?.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {book.user_association?.comments || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="text-blue-600">View →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}

        {/* Recommendations Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Book Recommendations</h2>
          <RecommendationsList
            recommendations={recommendations}
            loading={recLoading}
            error={recError}
          />
        </div>
      </div>
    </div>
  );
} 