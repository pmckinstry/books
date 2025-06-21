import Link from "next/link";

// Sample book data - in a real app, this would come from an API or database
const sampleBooks = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925 },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960 },
  { id: "3", title: "1984", author: "George Orwell", year: 1949 },
];

export default function BookDeletePage({ params }: { params: { id: string } }) {
  const book = sampleBooks.find(b => b.id === params.id);

  if (!book) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Book Not Found
          </h1>
          <Link 
            href="/books"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Back to Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Delete Book
        </h1>
        <Link 
          href={`/books/${book.id}`}
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          ← Back to Book
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="text-center space-y-6">
          <div className="text-red-600 dark:text-red-400">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Are you sure you want to delete this book?
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              This action cannot be undone. The book "{book.title}" by {book.author} will be permanently removed.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Book Details:</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <p><strong>Title:</strong> {book.title}</p>
              <p><strong>Author:</strong> {book.author}</p>
              <p><strong>Year:</strong> {book.year}</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Delete Book
            </button>
            <Link
              href={`/books/${book.id}`}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 