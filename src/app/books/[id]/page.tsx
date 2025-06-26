import { notFound } from 'next/navigation';
import Link from 'next/link';
import { bookOperations } from '@/lib/database';
import BookCoverImage from '@/components/BookCoverImage';
import AuthDebugger from '@/components/AuthDebugger';
import BookDetailsClient from '@/components/BookDetailsClient';
import CombinedRecommendations from '@/components/CombinedRecommendations';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  const bookId = parseInt(id);

  if (isNaN(bookId)) {
    notFound();
  }

  try {
    const book = await bookOperations.getById(bookId);
    
    if (!book) {
      notFound();
    }

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Book Details
          </h1>
          <Link 
            href="/books"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Books
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cover Image */}
            <div className="md:col-span-1">
              {book.cover_image_url ? (
                <BookCoverImage
                  src={book.cover_image_url}
                  alt={`Cover of ${book.title}`}
                  className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full max-w-xs mx-auto h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <BookDetailsClient book={book} userBookAssociation={null} />
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <CombinedRecommendations 
          bookTitle={book.title}
          bookAuthor={book.author}
        />

        <AuthDebugger />
      </div>
    );
  } catch (error) {
    console.error('Error fetching book:', error);
    notFound();
  }
} 