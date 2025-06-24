import { Book, CreateBookData, UpdateBookData } from './database';

const API_BASE = '/api/books';

export const api = {
  // Get all books
  async getAllBooks(): Promise<Book[]> {
    const response = await fetch(API_BASE);
    if (!response.ok) {
      throw new Error('Failed to fetch books');
    }
    return response.json();
  },

  // Get a single book by ID
  async getBook(id: number): Promise<Book> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      throw new Error('Failed to fetch book');
    }
    return response.json();
  },

  // Create a new book
  async createBook(data: CreateBookData & { genres: number[] }): Promise<Book> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create book');
    }
    
    return response.json();
  },

  // Update a book
  async updateBook(id: number, data: UpdateBookData): Promise<Book> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to update book');
    }
    
    return response.json();
  },

  // Delete a book
  async deleteBook(id: number): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Book not found');
      }
      throw new Error('Failed to delete book');
    }
  },
}; 