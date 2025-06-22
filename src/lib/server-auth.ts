import { NextRequest } from 'next/server';
import { userOperations } from './database';

// Server-side function to get user ID from request
export function getUserIdFromRequest(request: NextRequest): number | null {
  // For now, we'll use a simple approach with headers
  // In a real app, you'd use JWT tokens or session cookies
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // This is a placeholder - in a real app you'd decode a JWT token
    // For now, we'll return null and let the client handle auth
    return null;
  }
  
  return null;
}

// Server-side function to validate user exists
export function validateUser(userId: number): boolean {
  if (!userId) return false;
  
  try {
    const user = userOperations.getById(userId);
    return user !== null;
  } catch (error) {
    console.error('Error validating user:', error);
    return false;
  }
} 