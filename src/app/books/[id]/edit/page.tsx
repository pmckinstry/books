import EditBookForm from '@/components/EditBookForm';

export default async function BookEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBookForm bookId={id} />;
} 