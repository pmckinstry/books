import AuthGuard from '@/components/AuthGuard';
import CreateReadingListForm from '@/components/CreateReadingListForm';

export default function CreateReadingListPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Reading List</h1>
            <p className="text-gray-600 mt-2">
              Create a new reading list to organize your books
            </p>
          </div>
          
          <CreateReadingListForm />
        </div>
      </div>
    </AuthGuard>
  );
} 