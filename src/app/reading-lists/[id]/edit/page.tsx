import { notFound } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import EditReadingListForm from '@/components/EditReadingListForm';
import { readingListOperations } from '@/lib/database';

interface EditReadingListPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReadingListPage({ params }: EditReadingListPageProps) {
  const resolvedParams = await params;
  const readingListId = parseInt(resolvedParams.id);
  
  if (isNaN(readingListId)) {
    notFound();
  }

  const readingList = readingListOperations.getById(readingListId);
  if (!readingList) {
    notFound();
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Reading List</h1>
            <p className="text-gray-600 mt-2">
              Update your reading list details
            </p>
          </div>
          
          <EditReadingListForm readingListId={readingListId} />
        </div>
      </div>
    </AuthGuard>
  );
} 