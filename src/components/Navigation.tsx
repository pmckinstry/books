'use client';

import Link from "next/link";
import Image from "next/image";
// import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, removeCurrentUser, clearStaleUserData } from '@/lib/auth';

export default function Navigation() {
  // const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        // First clear any stale data
        clearStaleUserData();
        
        const currentUser = getCurrentUser();
        console.log('Navigation: Current user from localStorage:', currentUser);
        
        // Validate that the user object has required fields
        if (currentUser && currentUser.id && currentUser.username) {
          setUser(currentUser);
          console.log('Navigation: User is valid, setting user state');
        } else {
          // Clear invalid/stale data
          removeCurrentUser();
          setUser(null);
          console.log('Navigation: User is invalid, cleared data');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // On error, clear any stale data
        removeCurrentUser();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Listen for storage changes (when user logs in/out from other tabs or components)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        // Re-check auth status when localStorage changes
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
    };

    // Listen for custom auth state change events
    const handleAuthStateChange = (e: CustomEvent) => {
      setUser(e.detail.user);
    };

    // Listen for storage events from other tabs
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth state change events
    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    
    // Also check on page visibility change and focus
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
      }
    };
    
    const handleFocus = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('load', handleFocus);
    };
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
      // Even if logout fails, clear local data
      removeCurrentUser();
      setUser(null);
      window.location.href = '/login';
    }
  };

  // const handleRefreshAuth = () => {
  //   clearStaleUserData();
  //   const currentUser = getCurrentUser();
  //   setUser(currentUser);
  // };

  // const handleForceClearAuth = () => {
  //   forceClearAllAuthData();
  //   setUser(null);
  //   window.location.reload();
  // };

  // const handleDebugAuth = () => {
  //   debugAuthState();
  // };

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
      <div className="max-w-6xl mx-auto">
        {/* Row 1: Brand + primary links left; welcome + auth actions right */}
        <div className="flex items-center">
          <Link 
            href="/" 
            className="hover:opacity-90 transition-opacity"
            aria-label="Book Manager"
            title="Book Manager"
          >
            <Image src="/bookshelf.webp" alt="Book Manager" width={32} height={32} className="w-8 h-8" />
          </Link>
          <div className="ml-6 flex items-center gap-6">
            <Link href="/books" className="hover:text-gray-300 transition-colors">Books</Link>
            <Link href="/genres" className="hover:text-gray-300 transition-colors">Genres</Link>
            {user && (
              <>
                <Link href="/reading-lists" className="hover:text-gray-300 transition-colors">Reading Lists</Link>
                <Link href="/read" className="hover:text-gray-300 transition-colors">Read</Link>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="text-gray-300 hover:text-white transition-colors"
                  title="Profile"
                >
                  Welcome, {user.nickname || user.username}!
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-gray-300 transition-colors">Login</Link>
                <Link href="/register" className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md font-medium">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Single row layout; user-specific links included above */}
      </div>
    </nav>
  );
} 
