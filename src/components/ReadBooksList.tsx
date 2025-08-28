'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BookCoverImage from '@/components/BookCoverImage';
import { getCurrentUser } from '@/lib/auth';
import CombinedRecommendations from './CombinedRecommendations';

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

  const page = parseInt(searchParams.get('page') || '1');
  const limit = 10;

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  const fetchReadBooks = useCallback(async () => {
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
  }, [currentPage, searchTerm, sortBy, sortOrder, limit]);

  useEffect(() => {
    fetchReadBooks();
  }, [fetchReadBooks]);

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
          <h1 className="text-3xl font-bold text-gray-900">Books I&apos;ve Read</h1>
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
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-r-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 shadow-sm hover:shadow-md font-medium"
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
                className="mt-4 inline-block px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                Browse All Books
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Books you’ve read</h2>
              <div className="text-sm text-gray-500">
                {totalBooks} total
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {books.map((book) => (
                <div key={book.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {(() => {
                        const coverUrl = (book as any).cover_image_url || (book as any).coverImageUrl;
                        return coverUrl ? (
                          <BookCoverImage
                            src={coverUrl}
                            alt={`Cover of ${book.title}`}
                            className="w-16 h-24 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            <Link href={`/books/${book.id}`} className="hover:text-blue-600 transition-colors">
                              {book.title}
                            </Link>
                          </h3>
                          <p className="text-gray-600">
                            by{' '}
                            <span
                              className="text-sm text-gray-600 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => {
                                const params = new URLSearchParams();
                                params.set('search', book.author);
                                window.location.href = `/books?${params.toString()}`;
                              }}
                            >
                              {book.author}
                            </span>
                          </p>

                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            {(book as any).page_count && <span>{(book as any).page_count} pages</span>}
                            {book.language && <span>{book.language}</span>}
                            {book.isbn && <span>ISBN: {book.isbn}</span>}
                          </div>

                          {Array.isArray(book.genres) && book.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {book.genres
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((genre) => (
                                  <Link
                                    key={genre.id}
                                    href={`/genres/${genre.id}`}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                  >
                                    {genre.name}
                                  </Link>
                                ))}
                            </div>
                          )}

                          {book.user_association?.comments && (
                            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
                              <p className="text-sm text-gray-700">
                                <strong>Comments:</strong> {book.user_association.comments}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex items-center space-x-3">
                          <div>{renderStars(book.user_association?.rating)}</div>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
        <CombinedRecommendations 
          userId={getCurrentUser()?.id}
        />
      </div>
    </div>
  );
} 
