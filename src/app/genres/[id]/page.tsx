import GenreView from '@/components/GenreView';

interface GenrePageProps {
  params: Promise<{ id: string }>;
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { id } = await params;
  return <GenreView genreId={id} />;
} 