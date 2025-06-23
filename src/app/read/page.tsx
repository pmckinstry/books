import AuthGuard from '@/components/AuthGuard';
import ReadBooksList from '@/components/ReadBooksList';

export default function ReadBooksPage() {
  return (
    <AuthGuard>
      <ReadBooksList />
    </AuthGuard>
  );
} 