'use client';

import { useState } from 'react';
import Image from 'next/image';

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