import { NextRequest } from 'next/server';
import { userOperations } from './database-factory';

// Get user ID from cookie `user-id` or Authorization header (Bearer <base64>{"userId":...})
export function getUserIdFromRequest(request: NextRequest): string | null {
  // Try cookie first
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);
    if (cookies['user-id']) return cookies['user-id'];
  }

  // Fallback to Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      if (decoded?.userId !== undefined && decoded?.userId !== null) {
        return String(decoded.userId);
      }
    } catch {
      // ignore invalid token
    }
  }

  return null;
}

export function getUserFromRequest(request: NextRequest): { id: string } | null {
  const id = getUserIdFromRequest(request);
  return id ? { id } : null;
}

// Server-side function to validate user exists
export function validateUser(userId: string): boolean {
  if (!userId) return false;
  
  try {
    const user = userOperations.getById(userId);
    return user !== null;
  } catch (error) {
    console.error('Error validating user:', error);
    return false;
  }
}

// CSRF validation using double-submit cookie: header `x-csrf-token` must match `csrf-token` cookie
export function validateCsrf(request: NextRequest): boolean {
  const headerToken = request.headers.get('x-csrf-token');
  if (!headerToken) return false;
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return false;
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  return cookies['csrf-token'] === headerToken;
}
