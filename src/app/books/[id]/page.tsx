import { notFound } from 'next/navigation';
import Link from 'next/link';
import { bookOperations, userBookAssociationOperations } from '@/lib/database';
import UserBookAssociation from '@/components/UserBookAssociation';
import AuthDebugger from '@/components/AuthDebugger';

interface BookDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const resolvedParams = await params;
  const bookId = parseInt(resolvedParams.id);
  
  if (isNaN(bookId)) {
    notFound();
  }

  const book = bookOperations.getById(bookId);
  if (!book) {
    notFound();
  }

  // For now, we'll not fetch user association on the server side
  // to avoid hydration issues. The client component will handle this.
  const userAssociation = null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/books" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
        >
          ← Back to Books
        </Link>
      </div>

      {/* Debug component */}
      <div className="mb-4">
        <AuthDebugger />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Book Details */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{book.title}</h1>
            
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-700">Author:</span>
                <span className="ml-2 text-gray-900">{book.author}</span>
              </div>
              
              {book.year && (
                <div>
                  <span className="font-semibold text-gray-700">Year:</span>
                  <span className="ml-2 text-gray-900">{book.year}</span>
                </div>
              )}

              {book.genres && book.genres.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Genres:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {book.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {book.description && (
                <div>
                  <span className="font-semibold text-gray-700">Description:</span>
                  <p className="mt-2 text-gray-900 whitespace-pre-wrap">{book.description}</p>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                Added on {new Date(book.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <Link
                href={`/books/${book.id}/edit`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Book
              </Link>
              <Link
                href={`/books/${book.id}/delete`}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Book
              </Link>
            </div>
          </div>
        </div>

        {/* User Association */}
        <div className="lg:col-span-1">
          <UserBookAssociation 
            bookId={book.id} 
            initialAssociation={userAssociation}
          />
        </div>
      </div>
    </div>
  );
} 