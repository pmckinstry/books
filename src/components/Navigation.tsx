import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-gray-300 transition-colors"
          >
            Book Manager
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            href="/books" 
            className="hover:text-gray-300 transition-colors"
          >
            All Books
          </Link>
          <Link 
            href="/books/create" 
            className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded transition-colors"
          >
            Add Book
          </Link>
        </div>
      </div>
    </nav>
  );
} 