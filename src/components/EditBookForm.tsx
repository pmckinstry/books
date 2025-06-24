'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Book } from '@/lib/database';

interface EditBookFormProps {
  bookId: string;
}

export default function EditBookForm({ bookId }: EditBookFormProps) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    description: '',
    isbn: '',
    page_count: '',
    language: 'English',
    publisher: '',
    cover_image_url: '',
    publication_date: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const bookData = await api.getBook(parseInt(bookId));
        setBook(bookData);
        setFormData({
          title: bookData.title,
          author: bookData.author,
          year: bookData.year.toString(),
          description: bookData.description || '',
          isbn: bookData.isbn || '',
          page_count: bookData.page_count?.toString() || '',
          language: bookData.language || 'English',
          publisher: bookData.publisher || '',
          cover_image_url: bookData.cover_image_url || '',
          publication_date: bookData.publication_date || ''
        });
      } catch (error) {
        console.error('Error fetching book:', error);
        setErrors({ fetch: 'Failed to load book' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else {
      const year = parseInt(formData.year);
      if (isNaN(year) || year < 1000 || year > new Date().getFullYear() + 10) {
        newErrors.year = 'Year must be a valid number between 1000 and current year + 10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await api.updateBook(parseInt(bookId), {
        title: formData.title.trim(),
        author: formData.author.trim(),
        year: parseInt(formData.year),
        description: formData.description.trim() || undefined,
        isbn: formData.isbn.trim() || undefined,
        page_count: parseInt(formData.page_count) || undefined,
        language: formData.language.trim() || undefined,
        publisher: formData.publisher.trim() || undefined,
        cover_image_url: formData.cover_image_url.trim() || undefined,
        publication_date: formData.publication_date.trim() || undefined
      });

      router.push(`/books/${bookId}`);
      router.refresh();
    } catch (error) {
      console.error('Error updating book:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to update book' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading book...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch || !book) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Book Not Found
          </h1>
          <p className="text-gray-600 mb-4">{errors.fetch || 'The book you are looking for does not exist.'}</p>
          <Link 
            href="/books"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Book
        </h1>
        <Link 
          href={`/books/${book.id}`}
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Book
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author *
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.author ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author}</p>
            )}
          </div>

          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
              Publication Year *
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.year ? 'border-red-500' : 'border-gray-300'
              }`}
              min="1000"
              max={new Date().getFullYear() + 10}
            />
            {errors.year && (
              <p className="mt-1 text-sm text-red-600">{errors.year}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-2">
              ISBN
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.isbn ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.isbn && (
              <p className="mt-1 text-sm text-red-600">{errors.isbn}</p>
            )}
          </div>

          <div>
            <label htmlFor="page_count" className="block text-sm font-medium text-gray-700 mb-2">
              Page Count
            </label>
            <input
              type="number"
              id="page_count"
              name="page_count"
              value={formData.page_count}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.page_count ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.page_count && (
              <p className="mt-1 text-sm text-red-600">{errors.page_count}</p>
            )}
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <input
              type="text"
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.language ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language}</p>
            )}
          </div>

          <div>
            <label htmlFor="publisher" className="block text-sm font-medium text-gray-700 mb-2">
              Publisher
            </label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.publisher ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.publisher && (
              <p className="mt-1 text-sm text-red-600">{errors.publisher}</p>
            )}
          </div>

          <div>
            <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <input
              type="text"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.cover_image_url ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.cover_image_url && (
              <p className="mt-1 text-sm text-red-600">{errors.cover_image_url}</p>
            )}
          </div>

          <div>
            <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700 mb-2">
              Publication Date
            </label>
            <input
              type="text"
              id="publication_date"
              name="publication_date"
              value={formData.publication_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.publication_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.publication_date && (
              <p className="mt-1 text-sm text-red-600">{errors.publication_date}</p>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isSubmitting ? 'Updating...' : 'Update Book'}
            </button>
            <Link
              href={`/books/${book.id}`}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 