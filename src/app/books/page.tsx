import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BookSearch from '@/components/BookSearch';
import BookTable from '@/components/BookTable';
import BookSorting from '@/components/BookSorting';
import Pagination from '@/components/Pagination';
import { bookOperations, BookFilters, genreOperations } from '@/lib/database-factory';

async function getBooks(page: number, sortBy: string, sortOrder: 'asc' | 'desc', filters: BookFilters) {
  try {
    const limit = 10; // Books per page
    return bookOperations.getBooksWithPagination(page, limit, filters, sortBy, sortOrder);
  } catch (error) {
    console.error('Error fetching books:', error);
    return { books: [], total: 0, totalPages: 0 };
  }
}

export default async function BooksListPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    sortBy?: string; 
    sortOrder?: string; 
    search?: string;
    yearFrom?: string;
    yearTo?: string;
    language?: string;
    publisher?: string;
    pageCountFrom?: string;
    pageCountTo?: string;
    genreIds?: string;
  }>;
}) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const currentSortBy = params.sortBy || 'created_at';
  const currentSortOrder = (params.sortOrder as 'asc' | 'desc') || 'desc';
  
  // Build filters from search params
  const filters: BookFilters = {};
  
  if (params.search) filters.search = params.search;
  if (params.yearFrom) {
    const yearFrom = parseInt(params.yearFrom);
    if (!isNaN(yearFrom) && yearFrom > 0) filters.yearFrom = yearFrom;
  }
  if (params.yearTo) {
    const yearTo = parseInt(params.yearTo);
    if (!isNaN(yearTo) && yearTo > 0) filters.yearTo = yearTo;
  }
  if (params.language) filters.language = params.language;
  if (params.publisher) filters.publisher = params.publisher;
  if (params.pageCountFrom) {
    const pageCountFrom = parseInt(params.pageCountFrom);
    if (!isNaN(pageCountFrom) && pageCountFrom > 0) filters.pageCountFrom = pageCountFrom;
  }
  if (params.pageCountTo) {
    const pageCountTo = parseInt(params.pageCountTo);
    if (!isNaN(pageCountTo) && pageCountTo > 0) filters.pageCountTo = pageCountTo;
  }
  if (params.genreIds) {
    const genreIds = params.genreIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (genreIds.length > 0) filters.genreIds = genreIds;
  }
  
  const { books, total, totalPages, hasMore } = await getBooks(currentPage, currentSortBy, currentSortOrder, filters);
  
  // Get all genres for the advanced filters
  const genres = await genreOperations.getAll();
  
  // Check if any filters are active
  const hasFilters = Object.keys(filters).length > 0;

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
              {hasFilters && (
                <span className="ml-2 text-blue-600">
                  (filtered)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/books/add-with-url"
              className="btn-icon btn-icon-blue"
              aria-label="Add from URL"
              title="Add from URL"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </Link>
            <Link 
              href="/books/create"
              className="btn-icon btn-icon-blue"
              aria-label="Add new book"
              title="Add new book"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
          </div>
        </div>

        <BookSearch genres={genres} />

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {hasFilters ? 'No books found matching the current filters' : 'No books found'}
            </p>
            {hasFilters ? (
              <Link
                href="/books"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md font-medium"
              >
                Clear Filters
              </Link>
            ) : (
              <Link 
                href="/books/create"
                className="btn-icon btn-icon-blue w-12 h-12"
                aria-label="Add your first book"
                title="Add your first book"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <BookSorting 
                currentSortBy={currentSortBy}
                currentSortOrder={currentSortOrder}
              />
            </div>
            
            <BookTable books={books} />
            
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  baseUrl="/books"
                  searchParams={{ 
                    sortBy: currentSortBy, 
                    sortOrder: currentSortOrder,
                    ...(params.search && { search: params.search }),
                    ...(params.yearFrom && { yearFrom: params.yearFrom }),
                    ...(params.yearTo && { yearTo: params.yearTo }),
                    ...(params.language && { language: params.language }),
                    ...(params.publisher && { publisher: params.publisher }),
                    ...(params.pageCountFrom && { pageCountFrom: params.pageCountFrom }),
                    ...(params.pageCountTo && { pageCountTo: params.pageCountTo }),
                    ...(params.genreIds && { genreIds: params.genreIds })
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
} 
