// Simple in-memory cache for improving performance
class Cache<T> {
  private cache = new Map<string, { data: T; timestamp: number }>();
  private readonly ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) { // Default 5 minutes
    this.ttl = ttl;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item has expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    return this.cache.has(key) && !this.isExpired(key);
  }

  private isExpired(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return true;
    return Date.now() - item.timestamp > this.ttl;
  }
}

// Cache instances for different data types
export const booksCache = new Cache<unknown[]>(10 * 60 * 1000); // 10 minutes
export const genresCache = new Cache<unknown[]>(30 * 60 * 1000); // 30 minutes
export const readingListsCache = new Cache<unknown[]>(5 * 60 * 1000); // 5 minutes
export const userAssociationsCache = new Cache<unknown[]>(2 * 60 * 1000); // 2 minutes

// Cache keys
export const CACHE_KEYS = {
  ALL_BOOKS: 'all_books',
  ALL_GENRES: 'all_genres',
  USER_READING_LISTS: (userId: string) => `user_reading_lists_${userId}`,
  PUBLIC_READING_LISTS: 'public_reading_lists',
  USER_ASSOCIATIONS: (userId: string) => `user_associations_${userId}`,
} as const;
