import { Suspense } from 'react';
import AuthGuard from '@/components/AuthGuard';
import ReadBooksList from '@/components/ReadBooksList';

export default function ReadBooksPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading read books...</div>}>
        <ReadBooksList />
      </Suspense>
    </AuthGuard>
  );
} 