'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, removeCurrentUser } from '@/lib/auth';

export default function DebugPage() {
  const [user, setUser] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<string>('');

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Get all localStorage data
    const allData: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          allData[key] = localStorage.getItem(key);
        } catch (error) {
          allData[key] = 'Error reading value';
        }
      }
    }
    setLocalStorageData(JSON.stringify(allData, null, 2));
  }, []);

  const handleClearAuth = () => {
    removeCurrentUser();
    setUser(null);
    window.location.reload();
  };

  const handleClearAll = () => {
    localStorage.clear();
    setUser(null);
    setLocalStorageData('{}');
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Current User</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {user ? JSON.stringify(user, null, 2) : 'No user logged in'}
          </pre>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">localStorage Contents</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {localStorageData}
          </pre>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-x-4">
            <button
              onClick={handleClearAuth}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Clear Authentication
            </button>
            <button
              onClick={handleClearAll}
              className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900"
            >
              Clear All localStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 