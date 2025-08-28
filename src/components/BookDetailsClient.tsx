'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookWithGenres, UserBookAssociation } from '@/lib/database-factory';
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
              {book.genres
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((genre) => (
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

      <div className="flex items-center gap-3">
        <Link
          href={`/books/${book.id}/edit`}
          className="btn-icon btn-icon-blue w-12 h-12"
          aria-label="Edit book"
          title="Edit book"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Link>
        <Link
          href={`/books/${book.id}/delete`}
          className="btn-icon btn-icon-blue w-12 h-12"
          aria-label="Delete book"
          title="Delete book"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
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
