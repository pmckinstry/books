import Link from "next/link";
import { bookOperations } from "@/lib/database";
import { notFound } from "next/navigation";

// This is a Server Component that fetches data directly from the database
async function getBook(id: string) {
  try {
    const bookId = parseInt(id);
    if (isNaN(bookId)) {
      return null;
    }
    return bookOperations.getById(bookId);
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
}

export default async function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <p className="mt-1 text-lg text-gray-900">{book.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <p className="mt-1 text-lg text-gray-900">{book.author}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Publication Year
            </label>
            <p className="mt-1 text-lg text-gray-900">{book.year}</p>
          </div>

          {book.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <p className="mt-1 text-gray-900">{book.description}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <Link
              href={`/books/${book.id}/edit`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Book
            </Link>
            <Link
              href={`/books/${book.id}/delete`}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete Book
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 