'use client';

import { useState, useEffect } from 'react';
import RecommendationsList from './RecommendationsList';

interface ReadingListRecommendationsProps {
  readingListId: number;
}

export default function ReadingListRecommendations({ readingListId }: ReadingListRecommendationsProps) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/recommendations/reading-list/${readingListId}`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        setRecommendations(data.recommendations || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [readingListId]);

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4">Recommended for this list</h2>
      <RecommendationsList
        recommendations={recommendations}
        loading={loading}
        error={error}
      />
    </div>
  );
} 