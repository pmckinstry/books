import Link from "next/link";

// Sample book data - in a real app, this would come from an API or database
const sampleBooks = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: 1925, description: "A story of the fabulously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan." },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", year: 1960, description: "The story of young Scout Finch and her father Atticus in a racially divided Alabama town." },
  { id: "3", title: "1984", author: "George Orwell", year: 1949, description: "A dystopian novel about totalitarianism and surveillance society." },
];

export default function BookDetailPage({ params }: { params: { id: string } }) {
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
          Book Details
        </h1>
        <Link 
          href="/books"
          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          ← Back to Books
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{book.title}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Author
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{book.author}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Publication Year
            </label>
            <p className="mt-1 text-lg text-gray-900 dark:text-white">{book.year}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <p className="mt-1 text-gray-900 dark:text-white">{book.description}</p>
          </div>

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