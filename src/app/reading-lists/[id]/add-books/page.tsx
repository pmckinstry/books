'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookWithGenres } from '@/lib/database';
import AuthGuard from '@/components/AuthGuard';
import BookCoverImage from '@/components/BookCoverImage';

interface AddBooksToReadingListPageProps {
  params: Promise<{ id: string }>;
}

export default function AddBooksToReadingListPage({ params }: AddBooksToReadingListPageProps) {
  const [readingListId, setReadingListId] = useState<number | null>(null);
  const [readingListName, setReadingListName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState<BookWithGenres[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
  const [isAddingBooks, setIsAddingBooks] = useState(false);
  const [booksInList, setBooksInList] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    const loadReadingList = async () => {
      try {
        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        setReadingListId(id);

        const response = await fetch(`/api/reading-lists/${id}`, {
          headers: {
            'Authorization': 'Bearer dummy-token'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setReadingListName(data.readingList.name);
          // Store the books that are already in the list
          const existingBookIds = new Set<number>(data.readingList.books.map((book: any) => Number(book.id)));
          setBooksInList(existingBookIds);
        } else {
          setError('Failed to load reading list');
        }
      } catch (error) {
        setError('Failed to load reading list');
      }
    };

    loadReadingList();
  }, [params]);

  const searchBooks = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`/api/books?search=${encodeURIComponent(searchTerm.trim())}`, {
        headers: {
          'Authorization': 'Bearer dummy-token'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBooks(data.books || []);
      } else {
        const errorData = await response.json();
        setError('Failed to search books');
      }
    } catch (error) {
      setError('Failed to search books');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks();
  };

  const clearSearch = () => {
    setSearchTerm('');
    setBooks([]);
    setError('');
  };

  const toggleBookSelection = (bookId: number) => {
    // Don't allow selection if book is already in the list
    if (booksInList.has(bookId)) return;

    const newSelected = new Set(selectedBooks);
    if (newSelected.has(bookId)) {
      newSelected.delete(bookId);
    } else {
      newSelected.add(bookId);
    }
    setSelectedBooks(newSelected);
  };

  const addSelectedBooks = async () => {
    if (selectedBooks.size === 0 || !readingListId) return;

    setIsAddingBooks(true);
    setError('');
    setSuccessMessage('');

    try {
      const promises = Array.from(selectedBooks).map(bookId =>
        fetch(`/api/reading-lists/${readingListId}/books`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dummy-token'
          },
          body: JSON.stringify({ book_id: bookId })
        })
      );

      const results = await Promise.all(promises);
      const failedCount = results.filter(r => !r.ok).length;
      const successCount = results.length - failedCount;

      if (successCount > 0) {
        setSuccessMessage(`Successfully added ${successCount} book${successCount > 1 ? 's' : ''} to the reading list!`);
        
        // Add successfully added books to the booksInList set
        const newBooksInList = new Set(booksInList);
        Array.from(selectedBooks).forEach(bookId => {
          newBooksInList.add(bookId);
        });
        setBooksInList(newBooksInList);
        
        setSelectedBooks(new Set());
        
        // Refresh the book list to show updated status
        if (searchTerm.trim()) {
          searchBooks();
        }
      }

      if (failedCount > 0) {
        setError(`Failed to add ${failedCount} book${failedCount > 1 ? 's' : ''}. They may already be in the list.`);
      }
    } catch (error) {
      setError('Failed to add books to reading list');
    } finally {
      setIsAddingBooks(false);
    }
  };

  const isBookInList = (bookId: number) => {
    return booksInList.has(bookId);
  };

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link 
            href={`/reading-lists/${readingListId}`}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Reading List
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Books to Reading List</h1>
          <p className="text-gray-600">
            Add books to: <span className="font-semibold">{readingListName}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {successMessage}
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for books by title, author, ISBN, or description..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            {searchTerm.trim() && (
              <button
                type="button"
                onClick={clearSearch}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Selected Books Actions */}
        {selectedBooks.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 font-medium">
                {selectedBooks.size} book{selectedBooks.size > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={addSelectedBooks}
                disabled={isAddingBooks}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingBooks ? 'Adding...' : `Add ${selectedBooks.size} Book${selectedBooks.size > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* Books Results */}
        {books.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({books.length} books found)
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {books.map((book) => {
                const alreadyInList = isBookInList(book.id);
                const isSelected = selectedBooks.has(book.id);
                
                return (
                  <div key={book.id} className={`p-6 transition-colors ${alreadyInList ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBookSelection(book.id)}
                          disabled={alreadyInList}
                          className={`h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mt-2 ${
                            alreadyInList 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-blue-600'
                          }`}
                        />
                      </div>
                      
                      <div className="flex-shrink-0">
                        {book.cover_image_url ? (
                          <BookCoverImage
                            src={book.cover_image_url}
                            alt={`Cover of ${book.title}`}
                            className="w-16 h-24 object-cover rounded-md shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              <Link 
                                href={`/books/${book.id}`}
                                className="hover:text-blue-600 transition-colors"
                              >
                                {book.title}
                              </Link>
                            </h3>
                            <p className="text-gray-600">by {book.author}</p>
                            
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              {book.year && <span>{book.year}</span>}
                              {book.page_count && <span>{book.page_count} pages</span>}
                              {book.language && <span>{book.language}</span>}
                              {book.isbn && <span>ISBN: {book.isbn}</span>}
                            </div>
                            
                            {book.genres && book.genres.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {book.genres.map((genre) => (
                                  <span
                                    key={genre.id}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {genre.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            
                            {book.description && (
                              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                                {book.description}
                              </p>
                            )}
                          </div>
                          
                          {alreadyInList && (
                            <span className="text-sm text-green-600 font-medium flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Already in list
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && !isSearching && searchTerm.trim() && books.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse all books to find what you're looking for.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!isLoading && !isSearching && !searchTerm.trim() && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Search for books to add</h3>
            <p className="text-gray-500">
              Use the search box above to find books by title, author, ISBN, or description.
            </p>
          </div>
        )}
      </div>
    </AuthGuard>
  );
} 