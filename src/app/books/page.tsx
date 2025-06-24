import Link from "next/link";
import { bookOperations } from "@/lib/database";
import Pagination from "@/components/Pagination";
import AuthGuard from "@/components/AuthGuard";
import BookTable from "@/components/BookTable";
import BookSearch from "@/components/BookSearch";

// This is a Server Component that fetches data directly from the database
async function getBooks(page: number = 1, sortBy: string = 'created_at', sortOrder: 'asc' | 'desc' = 'desc', search?: string) {
  try {
    const limit = 10; // Books per page
    return bookOperations.getPaginated(page, limit, sortBy, sortOrder, search);
  } catch (error) {
    console.error('Error fetching books:', error);
    return { books: [], total: 0, totalPages: 0 };
  }
}

function BooksListContent({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            All Books
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your personal book collection
          </p>
        </div>
        <Link 
          href="/books/create"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add New Book
        </Link>
      </div>

      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">Loading books...</p>
      </div>
    </div>
  );
}

export default async function BooksListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sortBy?: string; sortOrder?: string; search?: string }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const currentSortBy = params.sortBy || 'created_at';
  const currentSortOrder = (params.sortOrder as 'asc' | 'desc') || 'desc';
  const currentSearch = params.search || '';
  
  const { books, total, totalPages } = await getBooks(currentPage, currentSortBy, currentSortOrder, currentSearch);

  return (
    <AuthGuard>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              All Books
            </h1>
            <p className="text-gray-600 mt-2">
              Showing {books.length} of {total} books
              {currentSearch && (
                <span className="ml-2 text-blue-600">
                  (filtered by search)
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link 
              href="/books/add-with-url"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add from URL
            </Link>
            <Link 
              href="/books/create"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Book
            </Link>
          </div>
        </div>

        <BookSearch />

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {currentSearch ? `No books found matching "${currentSearch}"` : 'No books found'}
            </p>
            {currentSearch ? (
              <Link
                href="/books"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear Search
              </Link>
            ) : (
              <Link 
                href="/books/create"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Your First Book
              </Link>
            )}
          </div>
        ) : (
          <>
            <BookTable books={books} />
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/books"
              searchParams={{ 
                sortBy: currentSortBy, 
                sortOrder: currentSortOrder,
                ...(currentSearch && { search: currentSearch })
              }}
            />
          </>
        )}
      </div>
    </AuthGuard>
  );
} 