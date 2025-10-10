import { notFound } from 'next/navigation';
import Link from 'next/link';
import { bookOperations } from '@/lib/database-factory';
import BookCoverImage from '@/components/BookCoverImage';
import AuthDebugger from '@/components/AuthDebugger';
import BookDetailsClient from '@/components/BookDetailsClient';
import CombinedRecommendations from '@/components/CombinedRecommendations';
import { cookies } from 'next/headers';
import { userBookAssociationOperations } from '@/lib/database-factory';

interface BookPageProps {
  params: Promise<{ id: string }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id } = await params;
  
  // Handle both string and numeric IDs based on database type
  let bookId: string | number;
  const numericId = parseInt(id);
  
      // If it's a valid number, try numeric ID first (for SQLite), otherwise use string (for DynamoDB)
  if (!isNaN(numericId) && numericId.toString() === id) {
    bookId = numericId;
  } else {
    bookId = id;
  }

  try {
    const book = await bookOperations.getById(bookId as string | number);
    
    if (!book) {
      notFound();
    }

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user-id');
    const userId = userCookie?.value;

    let userAssociation = null;
    if (userId) {
      try {
        userAssociation = await userBookAssociationOperations.getByUserAndBook(userId, String(book.id));
      } catch (associationError) {
        console.warn('Failed to load user-book association:', associationError);
      }
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
              {(() => {
                const cover = (book as unknown as { cover_image_url?: string; coverImageUrl?: string });
                const src = cover.cover_image_url ?? cover.coverImageUrl;
                return (
                  <BookCoverImage
                    src={src}
                    alt={`Cover of ${book.title}`}
                    className="w-full max-w-xs mx-auto rounded-lg shadow-md"
                  />
                );
              })()}
            </div>

            {/* Book Details */}
            <div className="md:col-span-2">
              <BookDetailsClient book={book} userBookAssociation={userAssociation} />
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <CombinedRecommendations 
          userId={userId}
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
