'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    if (!currentUser) {
      setShouldRedirect(true);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/login');
    }
  }, [shouldRedirect, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to Book Manager
        </h1>
        <p className="text-xl text-gray-600 max-w-md">
          Welcome back, {user.username}! Manage your personal book collection with our easy-to-use interface.
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
