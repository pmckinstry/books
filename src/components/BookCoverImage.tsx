'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BookCoverImageProps {
  src?: string;
  alt: string;
  className?: string;
}

export default function BookCoverImage({ src, alt, className = "w-32 h-48 object-cover rounded-md shadow-md" }: BookCoverImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className={className}>
        <div className="w-full aspect-[2/3] bg-gray-200 rounded-md flex items-center justify-center">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <Image 
      src={src} 
      alt={alt}
      width={128}
      height={192}
      className={className}
      onError={() => setImageError(true)}
    />
  );
} 
