'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, getCurrentUserId, debugAuthState, clearStaleUserData, forceClearAllAuthData } from '@/lib/auth';

export default function AuthDebugger() {
  const [user, setUser] = useState<any>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localStorageData, setLocalStorageData] = useState<string>('');

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = getCurrentUser();
      const currentUserId = getCurrentUserId();
      
      // Also check raw localStorage data
      const rawData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      console.log('AuthDebugger: Current user:', currentUser);
      console.log('AuthDebugger: Current user ID:', currentUserId);
      console.log('AuthDebugger: Raw localStorage data:', rawData);
      
      setUser(currentUser);
      setUserId(currentUserId);
      setLocalStorageData(rawData || 'null');
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleDebug = () => {
    debugAuthState();
  };

  const handleRefresh = () => {
    clearStaleUserData();
    const currentUser = getCurrentUser();
    const currentUserId = getCurrentUserId();
    setUser(currentUser);
    setUserId(currentUserId);
  };

  const handleForceClear = () => {
    forceClearAllAuthData();
    setUser(null);
    setUserId(null);
    setLocalStorageData('null');
  };

  if (isLoading) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <p className="text-sm text-gray-600">Loading auth debug info...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2">Auth Debug Info</h3>
      <div className="text-xs space-y-1">
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}</p>
        <p><strong>User ID:</strong> {userId || 'null'}</p>
        <p><strong>Raw localStorage:</strong> {localStorageData}</p>
        <div className="mt-2 space-x-2">
          <button
            onClick={handleDebug}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Debug localStorage
          </button>
          <button
            onClick={handleRefresh}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Refresh Auth
          </button>
          <button
            onClick={handleForceClear}
            className="bg-red-500 text-white px-2 py-1 rounded text-xs"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
} 