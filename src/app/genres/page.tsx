import { Suspense } from 'react';
import GenreList from '@/components/GenreList';

export default function GenresPage() {
  return (
    <Suspense fallback={<div>Loading genres...</div>}>
      <GenreList />
    </Suspense>
  );
} 