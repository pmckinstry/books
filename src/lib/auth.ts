import { User } from './database';

export interface AuthUser {
  id: number;
  username: string;
  created_at: string;
  updated_at: string;
}

// Get user from localStorage (client-side only)
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr) as AuthUser;
    return user;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

// Set user in localStorage (client-side only)
export function setCurrentUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user', JSON.stringify(user));
  } catch (error) {
    console.error('Error setting user in localStorage:', error);
  }
}

// Remove user from localStorage (client-side only)
export function removeCurrentUser(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Get user ID - returns null on server, actual ID on client
export function getCurrentUserId(): number | null {
  const user = getCurrentUser();
  return user?.id || null;
}

// Client-side only function to get user ID safely
export function getCurrentUserIdClient(): number | null {
  if (typeof window === 'undefined') return null;
  return getCurrentUserId();
} 