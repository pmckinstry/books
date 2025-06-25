import React from 'react';
import Link from 'next/link';

interface Recommendation {
  title: string;
  author: string;
  reason: string;
  genre?: string;
}

interface RecommendationsListProps {
  recommendations: Recommendation[];
  loading: boolean;
  error: string | null;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations, loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600">Finding recommendations...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
        {error}
      </div>
    );
  }
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="text-gray-500">No recommendations found. Read more books to get personalized suggestions!</div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {recommendations.slice(0, 10).map((rec, idx) => (
        <div key={idx} className="bg-white shadow rounded-lg p-5 flex flex-col h-full">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{rec.title}</h3>
            <p className="text-gray-700 mb-2">by <span className="font-medium">{rec.author}</span></p>
            {rec.genre && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">{rec.genre}</span>
            )}
            <p className="text-gray-600 text-sm">{rec.reason}</p>
          </div>
          <div className="mt-4">
            <Link href={`/books?search=${encodeURIComponent(rec.title)}`} className="text-blue-600 hover:underline text-sm font-medium">View Book</Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationsList; 