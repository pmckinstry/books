import EditGenreForm from '@/components/EditGenreForm';

interface EditGenrePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGenrePage({ params }: EditGenrePageProps) {
  const { id } = await params;
  return <EditGenreForm genreId={id} />;
} 