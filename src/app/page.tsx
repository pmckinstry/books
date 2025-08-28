'use client';

import Link from "next/link";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [readTotal, setReadTotal] = useState<number | null>(null);
  const [listsTotal, setListsTotal] = useState<number | null>(null);

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

  // Fetch quick highlights (counts)
  useEffect(() => {
    async function fetchHighlights() {
      try {
        const current = getCurrentUser();
        // Read books total
        const token = current?.id ? Buffer.from(JSON.stringify({ userId: current.id })).toString('base64') : undefined;
        const readRes = await fetch('/api/user-books/read?page=1&limit=1', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (readRes.ok) {
          const data = await readRes.json();
          setReadTotal(typeof data.total === 'number' ? data.total : 0);
        }

        // Reading lists total
        const listsRes = await fetch('/api/reading-lists?type=user', {
          headers: { Authorization: 'Bearer dummy-token' },
        });
        if (listsRes.ok) {
          const data = await listsRes.json();
          setListsTotal(Array.isArray(data.readingLists) ? data.readingLists.length : 0);
        }
      } catch {
        // ignore
      }
    }

    if (user) fetchHighlights();
  }, [user]);

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
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.nickname || user?.username}!</h1>
          <p className="text-gray-600 mt-2">Jump into your reading progress or manage your reading lists.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/read"
            className="block rounded-xl border border-blue-400 bg-white p-6 hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-blue-700 border border-blue-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Your Read Books</h2>
                <p className="text-sm text-gray-600">{readTotal !== null ? `${readTotal} book${readTotal === 1 ? '' : 's'} read` : 'Explore your finished reads'}</p>
              </div>
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          <Link 
            href="/reading-lists"
            className="block rounded-xl border border-blue-400 bg-white p-6 hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white text-blue-700 border border-blue-300 shadow-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">Your Reading Lists</h2>
                <p className="text-sm text-gray-600">{listsTotal !== null ? `${listsTotal} list${listsTotal === 1 ? '' : 's'}` : 'Create and organize lists'}</p>
              </div>
              <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
