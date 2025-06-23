'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function AuthGuard({ children, redirectTo = '/login' }: AuthGuardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const user = getCurrentUser();
      console.log('AuthGuard: getCurrentUser returned:', user);
      
      if (user && user.id && user.username) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (isLoading) {
        // Only redirect if we're still loading (first check)
        router.push(redirectTo);
      }
    };

    // Try immediately
    checkAuth();
    
    // Try multiple times with increasing delays
    const timers = [
      setTimeout(checkAuth, 100),
      setTimeout(checkAuth, 500),
      setTimeout(checkAuth, 1000),
      setTimeout(checkAuth, 2000)
    ];
    
    // Listen for auth state changes
    const handleAuthStateChange = (e: CustomEvent) => {
      console.log('AuthGuard: auth state changed:', e.detail);
      if (e.detail.user) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(redirectTo);
      }
    };

    window.addEventListener('authStateChanged', handleAuthStateChange as EventListener);
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      window.removeEventListener('authStateChanged', handleAuthStateChange as EventListener);
    };
  }, [router, redirectTo, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 