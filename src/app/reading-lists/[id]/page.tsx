import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readingListOperations } from '@/lib/database';
import AuthGuard from '@/components/AuthGuard';
import ReadingListBookItem from '@/components/ReadingListBookItem';
import ReadingListRecommendations from '@/components/ReadingListRecommendations';

interface ReadingListDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ReadingListDetailPage({ params }: ReadingListDetailPageProps) {
  const resolvedParams = await params;
  const readingListId = parseInt(resolvedParams.id);
  
  if (isNaN(readingListId)) {
    notFound();
  }

  const readingList = readingListOperations.getByIdWithBooks(readingListId);
  if (!readingList) {
    notFound();
  }

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Link 
            href="/reading-lists" 
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Reading Lists
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{readingList.name}</h1>
              {readingList.description && (
                <p className="text-gray-600 text-lg mb-4">{readingList.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {readingList.book_count} books
                </span>
                
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Updated {new Date(readingList.updated_at).toLocaleDateString()}
                </span>
                
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {readingList.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link
                href={`/reading-lists/${readingList.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit List
              </Link>
              <Link
                href={`/reading-lists/${readingList.id}/add-books`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Add Books
              </Link>
            </div>
          </div>
        </div>

        {/* Books List */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Books in this list</h2>
          </div>
          
          {readingList.books.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
              <p className="text-gray-500 mb-6">
                Start adding books to your reading list.
              </p>
              <Link
                href={`/reading-lists/${readingList.id}/add-books`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Your First Book
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {readingList.books.map((book) => (
                <ReadingListBookItem 
                  key={book.id} 
                  book={book} 
                  readingListId={readingList.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommendations Section */}
        <ReadingListRecommendations readingListId={readingList.id} />
      </div>
    </AuthGuard>
  );
} 