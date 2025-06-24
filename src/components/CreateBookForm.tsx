'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Genre {
  id: number;
  name: string;
}

export default function CreateBookForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    isbn: '',
    page_count: '',
    language: 'English',
    publisher: '',
    cover_image_url: '',
    publication_date: ''
  });
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Fetch genres from the backend
    fetch('/api/genres')
      .then(res => res.json())
      .then(data => setGenres(data.genres || []));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    setSelectedGenres(options.map(opt => parseInt(opt.value)));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required';
    }

    // Validate ISBN if provided
    if (formData.isbn.trim() && !/^(?:\d{10}|\d{13})$/.test(formData.isbn.replace(/[-\s]/g, ''))) {
      newErrors.isbn = 'ISBN must be a valid 10 or 13 digit number';
    }

    // Validate page count if provided
    if (formData.page_count.trim()) {
      const pageCount = parseInt(formData.page_count);
      if (isNaN(pageCount) || pageCount < 1) {
        newErrors.page_count = 'Page count must be a positive number';
      }
    }

    // Validate publication date if provided
    if (formData.publication_date.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(formData.publication_date)) {
      newErrors.publication_date = 'Publication date must be in YYYY-MM-DD format';
    }

    if (selectedGenres.length === 0) {
      newErrors.genres = 'Please select at least one genre';
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
      await api.createBook({
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim() || undefined,
        isbn: formData.isbn.trim() || undefined,
        page_count: formData.page_count.trim() ? parseInt(formData.page_count) : undefined,
        language: formData.language.trim(),
        publisher: formData.publisher.trim() || undefined,
        cover_image_url: formData.cover_image_url.trim() || undefined,
        publication_date: formData.publication_date.trim() || undefined,
        genres: selectedGenres
      });

      router.push('/books');
      router.refresh();
    } catch (error) {
      console.error('Error creating book:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create book' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Add New Book
        </h1>
        <Link 
          href="/books"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Books
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
              placeholder="Enter book title"
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
              placeholder="Enter author name"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author}</p>
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
              placeholder="Enter book description (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                placeholder="Enter ISBN (optional)"
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
                placeholder="Enter page count (optional)"
                min="1"
              />
              {errors.page_count && (
                <p className="mt-1 text-sm text-red-600">{errors.page_count}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter language"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter publisher (optional)"
              />
            </div>
          </div>

          <div>
            <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              id="cover_image_url"
              name="cover_image_url"
              value={formData.cover_image_url}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter cover image URL (optional)"
            />
          </div>

          <div>
            <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700 mb-2">
              Publication Date
            </label>
            <input
              type="date"
              id="publication_date"
              name="publication_date"
              value={formData.publication_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.publication_date ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter publication date (optional)"
            />
            {errors.publication_date && (
              <p className="mt-1 text-sm text-red-600">{errors.publication_date}</p>
            )}
          </div>

          <div>
            <label htmlFor="genres" className="block text-sm font-medium text-gray-700 mb-2">
              Genres *
            </label>
            <select
              id="genres"
              name="genres"
              multiple
              value={selectedGenres.map(String)}
              onChange={handleGenreChange}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.genres ? 'border-red-500' : 'border-gray-300'
              }`}
              size={Math.min(6, genres.length)}
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
            {errors.genres && (
              <p className="mt-1 text-sm text-red-600">{errors.genres}</p>
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
              {isSubmitting ? 'Creating...' : 'Create Book'}
            </button>
            <Link
              href="/books"
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