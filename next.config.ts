import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during development to allow testing
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript checking during development to allow testing
    ignoreBuildErrors: true,
  },
  images: {
    // Allow external images from book cover sources
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.goodreads.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
