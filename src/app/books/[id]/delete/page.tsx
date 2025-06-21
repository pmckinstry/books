import DeleteBookForm from '@/components/DeleteBookForm';

export default async function BookDeletePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DeleteBookForm bookId={id} />;
} 