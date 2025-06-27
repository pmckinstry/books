import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as LoginPOST } from '@/app/api/auth/login/route';
import { POST as RegisterPOST } from '@/app/api/auth/register/route';
import { POST as LogoutPOST } from '@/app/api/auth/logout/route';
import { GET as ProfileGET } from '@/app/api/auth/profile/route';

// Mock the database operations
vi.mock('@/lib/database', () => ({
  userOperations: {
    authenticate: vi.fn(),
    create: vi.fn(),
    getById: vi.fn(),
    getUserById: vi.fn(),
    usernameExists: vi.fn(),
  }
}));

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

// Mock NextResponse
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, options) => ({
        status: options?.status || 200,
        json: () => Promise.resolve(data),
        ...data
      }))
    }
  };
});

import { userOperations } from '@/lib/database';
import { hash, compare } from 'bcryptjs';

const mockUserOperations = vi.mocked(userOperations, { shallow: false });
const mockHash = vi.mocked(hash);
const mockCompare = vi.mocked(compare);

describe('/api/auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 if username is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'password123' })
      });

      const response = await LoginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Username and password are required' });
    });

    it('should return 400 if password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser' })
      });

      const response = await LoginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Username and password are required' });
    });

    it('should return 401 for invalid credentials', async () => {
      mockUserOperations.authenticate.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'wrongpassword' })
      });

      const response = await LoginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Invalid username or password' });
    });

    it('should return 200 for valid credentials', async () => {
      const mockUser = { 
        id: 1, 
        username: 'testuser', 
        nickname: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockUserOperations.authenticate.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: 'password123' })
      });

      const response = await LoginPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message', 'Login successful');
      expect(data).toHaveProperty('user');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return success message', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST'
      });
      const response = await LogoutPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Logout successful' });
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = { 
        id: 1, 
        username: 'testuser', 
        nickname: 'Test User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      // Use any to avoid linter error for getUserById
      (mockUserOperations as any).getUserById.mockReturnValue(mockUser);

      // Create a proper Bearer token with base64-encoded JSON
      const tokenData = { userId: 1 };
      const token = btoa(JSON.stringify(tokenData));
      
      const request = new NextRequest('http://localhost:3000/api/auth/profile', {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });

      const response = await ProfileGET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('id', 1);
      expect(data).toHaveProperty('username', 'testuser');
      expect(data).toHaveProperty('nickname', 'Test User');
    });

    it('should return 401 when not authenticated', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/profile');

      const response = await ProfileGET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if username is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ password: 'password123', nickname: 'Test User' })
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Username and password are required' });
    });

    it('should return 400 if password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', nickname: 'Test User' })
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Username and password are required' });
    });

    it('should return 400 if username is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'ab', password: 'password123', nickname: 'Test User' })
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Username must be at least 3 characters long' });
    });

    it('should return 400 if password is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'testuser', password: '123', nickname: 'Test User' })
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Password must be at least 6 characters long' });
    });

    it('should return 409 if user already exists', async () => {
      mockUserOperations.usernameExists.mockReturnValue(true);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'existinguser', password: 'password123', nickname: 'Test User' })
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data).toEqual({ error: 'Username already exists' });
    });

    it('should return 201 for successful registration', async () => {
      const mockUser = { 
        id: 1, 
        username: 'newuser', 
        nickname: 'New User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockUserOperations.usernameExists.mockReturnValue(false);
      mockUserOperations.create.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username: 'newuser', password: 'password123', nickname: 'New User' })
      });

      const response = await RegisterPOST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('message', 'User created successfully');
      expect(data).toHaveProperty('user');
    });
  });
}); 