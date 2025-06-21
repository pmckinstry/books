'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, removeCurrentUser } from '@/lib/auth';

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      removeCurrentUser();
      setUser(null);
      // Force a full page reload to refresh navigation
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
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
        </div>
      </nav>
    );
  }

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
          {user ? (
            <>
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
              <span className="text-gray-300">
                Welcome, {user.username}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="hover:text-gray-300 transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 