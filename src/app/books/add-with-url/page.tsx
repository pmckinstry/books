'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BookCoverImage from '@/components/BookCoverImage';

interface Genre {
  id: number;
  name: string;
}

interface ScrapedBookData {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  genres?: string[];
}

export default function AddBookWithUrlPage() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ScrapedBookData | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Fetch genres from the backend
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => setGenres(data.genres || []));
  }, []);

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    setSelectedGenres(options.map(opt => parseInt(opt.value)));
  };

  const scrapeBookData = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setIsScraping(true);
    setError('');
    setScrapedData(null);

    try {
      const response = await fetch('/api/books/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({ url: url.trim() })
      });

      if (response.ok) {
        const data = await response.json();
        setScrapedData(data.bookData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape book data');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to scrape book data');
    } finally {
      setIsScraping(false);
    }
  };

  const saveBook = async () => {
    if (!scrapedData) return;

    // Validate required fields
    if (!scrapedData.title || !scrapedData.author) {
      setError('Title and author are required');
      return;
    }

    if (selectedGenres.length === 0) {
      setError('Please select at least one genre');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dummy-token'
        },
        body: JSON.stringify({
          title: scrapedData.title,
          author: scrapedData.author,
          description: scrapedData.description,
          isbn: scrapedData.isbn,
          page_count: scrapedData.page_count,
          language: scrapedData.language,
          publisher: scrapedData.publisher,
          cover_image_url: scrapedData.cover_image_url,
          publication_date: scrapedData.publication_date,
          genres: selectedGenres
        })
      });

      if (response.ok) {
        const savedBook = await response.json();
        setSuccessMessage('Book added successfully!');
        
        setTimeout(() => {
          router.push(`/books/${savedBook.id}`);
        }, 1500);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save book');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save book');
    } finally {
      setIsSaving(false);
    }
  };

  const clearForm = () => {
    setUrl('');
    setScrapedData(null);
    setSelectedGenres([]);
    setError('');
    setSuccessMessage('');
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Link 
            href="/books" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Books
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Book from URL</h1>
          <p className="text-gray-600">
            Enter a URL from a book website to automatically scrape book details
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

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Enter Book URL</h2>
          
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.goodreads.com/book/show/... or https://www.amazon.com/..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isScraping}
              />
            </div>
            <button
              onClick={scrapeBookData}
              disabled={isScraping || !url.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isScraping ? 'Scraping...' : 'Scrape Data'}
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p className="font-medium mb-2">Supported websites:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Goodreads (goodreads.com)</li>
              <li>Amazon (amazon.com)</li>
              <li>Barnes & Noble (barnesandnoble.com)</li>
              <li>Google Books (books.google.com)</li>
            </ul>
          </div>
        </div>

        {scrapedData && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Scraped Book Data</h2>
              <div className="flex space-x-3">
                <button
                  onClick={clearForm}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={saveBook}
                  disabled={isSaving || !scrapedData.title || !scrapedData.author || selectedGenres.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Book'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {scrapedData.cover_image_url ? (
                  <BookCoverImage
                    src={scrapedData.cover_image_url}
                    alt={`Cover of ${scrapedData.title}`}
                    className="w-full max-w-xs mx-auto object-cover rounded-md shadow-sm"
                  />
                ) : (
                  <div className="w-full max-w-xs mx-auto h-96 bg-gray-200 rounded-md flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={scrapedData.title || ''}
                    onChange={(e) => setScrapedData({ ...scrapedData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Book title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    value={scrapedData.author || ''}
                    onChange={(e) => setScrapedData({ ...scrapedData, author: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Author name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      value={scrapedData.isbn || ''}
                      onChange={(e) => setScrapedData({ ...scrapedData, isbn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ISBN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pages
                    </label>
                    <input
                      type="number"
                      value={scrapedData.page_count || ''}
                      onChange={(e) => setScrapedData({ ...scrapedData, page_count: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of pages"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <input
                      type="text"
                      value={scrapedData.language || ''}
                      onChange={(e) => setScrapedData({ ...scrapedData, language: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Language"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={scrapedData.publisher || ''}
                      onChange={(e) => setScrapedData({ ...scrapedData, publisher: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Publisher"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publication Date
                  </label>
                  <input
                    type="date"
                    value={scrapedData.publication_date || ''}
                    onChange={(e) => setScrapedData({ ...scrapedData, publication_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Genres *
                  </label>
                  <select
                    multiple
                    value={selectedGenres.map(String)}
                    onChange={handleGenreChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    size={Math.min(6, genres.length)}
                  >
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple genres</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={scrapedData.description || ''}
                    onChange={(e) => setScrapedData({ ...scrapedData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Book description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={scrapedData.cover_image_url || ''}
                    onChange={(e) => setScrapedData({ ...scrapedData, cover_image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Cover image URL"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
