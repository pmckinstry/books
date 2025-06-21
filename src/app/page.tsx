import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Book Manager
        </h1>
        <p className="text-xl text-gray-600 max-w-md">
          Manage your personal book collection with our easy-to-use CRUD interface.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/books" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            View All Books
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Available actions:</p>
            <ul className="mt-2 space-y-1">
              <li>• View all books</li>
              <li>• Add new books</li>
              <li>• Edit existing books</li>
              <li>• Delete books</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
