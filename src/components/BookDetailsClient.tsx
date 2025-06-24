'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookWithGenres, UserBookAssociation } from '@/lib/database';
import UserBookAssociationComponent from '@/components/UserBookAssociation';

interface BookDetailsClientProps {
  book: BookWithGenres;
  userBookAssociation: UserBookAssociation | null;
}

export default function BookDetailsClient({ book, userBookAssociation }: BookDetailsClientProps) {
  const router = useRouter();

  const handleAuthorClick = () => {
    const params = new URLSearchParams();
    params.set('search', book.author);
    router.push(`/books?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h2>
        
        <div className="text-sm text-gray-600">
          by <span 
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={handleAuthorClick}
          >
            {book.author}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {book.isbn && (
          <div>
            <span className="font-semibold text-gray-700">ISBN:</span>
            <span className="ml-2 text-gray-900">{book.isbn}</span>
          </div>
        )}

        {book.page_count && (
          <div>
            <span className="font-semibold text-gray-700">Pages:</span>
            <span className="ml-2 text-gray-900">{book.page_count}</span>
          </div>
        )}

        {book.language && (
          <div>
            <span className="font-semibold text-gray-700">Language:</span>
            <span className="ml-2 text-gray-900">{book.language}</span>
          </div>
        )}

        {book.publisher && (
          <div>
            <span className="font-semibold text-gray-700">Publisher:</span>
            <span className="ml-2 text-gray-900">{book.publisher}</span>
          </div>
        )}

        {book.publication_date && (
          <div>
            <span className="font-semibold text-gray-700">Publication Date:</span>
            <span className="ml-2 text-gray-900">
              {new Date(book.publication_date).toLocaleDateString()}
            </span>
          </div>
        )}

        {book.genres && book.genres.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">Genres:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {book.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.id}`}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                >
                  {genre.name}
                </Link>
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

      <div className="flex space-x-4">
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

      {/* User Association */}
      <div className="mt-8">
        <UserBookAssociationComponent 
          bookId={book.id} 
          initialAssociation={userBookAssociation}
        />
      </div>
    </div>
  );
} 