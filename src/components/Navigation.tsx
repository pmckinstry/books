'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, removeCurrentUser, clearStaleUserData, forceClearAllAuthData, debugAuthState } from '@/lib/auth';

export default function Navigation() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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

  const handleRefreshAuth = () => {
    clearStaleUserData();
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const handleForceClearAuth = () => {
    forceClearAllAuthData();
    setUser(null);
    window.location.reload();
  };

  const handleDebugAuth = () => {
    debugAuthState();
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
                href="/genres" 
                className="hover:text-gray-300 transition-colors"
              >
                Genres
              </Link>
              <Link 
                href="/profile" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Welcome, {user.nickname || user.username}!
              </Link>
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