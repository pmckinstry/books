import { User } from './database';

export interface AuthUser {
  id: number;
  username: string;
  nickname?: string;
  created_at: string;
  updated_at: string;
}

interface StoredUserData {
  user: AuthUser;
  timestamp: number;
  expiresAt: number;
}

// Get user from localStorage (client-side only)
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    // Try to parse as new format with timestamp first
    try {
      const storedData = JSON.parse(userStr) as StoredUserData;
      const now = Date.now();
      
      // Check if data has expired (7 days instead of 24 hours for better UX)
      if (storedData.expiresAt && now > storedData.expiresAt) {
        console.log('User data has expired, clearing...');
        localStorage.removeItem('user');
        return null;
      }
      
      return storedData.user;
    } catch {
      // Fallback to old format (without timestamp)
      const user = JSON.parse(userStr) as AuthUser;
      
      // If it's the old format, convert it to new format
      if (user && user.id && user.username) {
        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        const storedData: StoredUserData = {
          user,
          timestamp: Date.now(),
          expiresAt
        };
        localStorage.setItem('user', JSON.stringify(storedData));
        console.log('Converted old format user data to new format');
        return user;
      }
      
      return null;
    }
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

// Set user in localStorage (client-side only)
export function setCurrentUser(user: AuthUser): void {
  if (typeof window === 'undefined') return;
  
  try {
    const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
    const storedData: StoredUserData = {
      user,
      timestamp: Date.now(),
      expiresAt
    };
    localStorage.setItem('user', JSON.stringify(storedData));
    
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
  } catch (error) {
    console.error('Error setting user in localStorage:', error);
  }
}

// Remove user from localStorage (client-side only)
export function removeCurrentUser(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('user');
    
    // Dispatch custom event to notify components of auth state change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user: null } }));
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

// Clear stale or invalid user data
export function clearStaleUserData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        // Try to parse as new format first
        const storedData = JSON.parse(userStr) as StoredUserData;
        if (!storedData.user || !storedData.user.id || !storedData.user.username) {
          localStorage.removeItem('user');
        }
      } catch {
        // Fallback to old format
        const user = JSON.parse(userStr) as AuthUser;
        if (!user || !user.id || !user.username) {
          localStorage.removeItem('user');
        }
      }
    }
  } catch (error) {
    console.error('Error clearing stale user data:', error);
    // If there's any error parsing, clear the data
    localStorage.removeItem('user');
  }
}

// Force clear all auth data (for debugging)
export function forceClearAllAuthData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('user');
    console.log('All auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
}

// Debug function to log current localStorage state
export function debugAuthState(): void {
  if (typeof window === 'undefined') return;
  
  try {
    const userStr = localStorage.getItem('user');
    console.log('Current localStorage user data:', userStr);
    
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        console.log('Parsed user data:', parsed);
        
        if (parsed.expiresAt) {
          const now = Date.now();
          const timeLeft = parsed.expiresAt - now;
          console.log(`Data expires in ${Math.round(timeLeft / 1000 / 60)} minutes`);
        }
      } catch (error) {
        console.log('Error parsing user data:', error);
      }
    }
  } catch (error) {
    console.error('Error debugging auth state:', error);
  }
} 