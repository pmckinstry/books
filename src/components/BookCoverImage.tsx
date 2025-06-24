'use client';

import { useState } from 'react';

interface BookCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function BookCoverImage({ src, alt, className = "w-32 h-48 object-cover rounded-md shadow-md" }: BookCoverImageProps) {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center text-gray-500 text-sm`}>
        No Cover
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      onError={() => setImageError(true)}
    />
  );
} 