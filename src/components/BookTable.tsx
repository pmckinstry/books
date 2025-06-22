'use client';

import Link from "next/link";
import { Book } from "@/lib/database";
import { getCurrentUserId } from '@/lib/auth';
import { useState, useEffect } from 'react';

interface UserAssociation {
  read_status: 'unread' | 'reading' | 'read';
  rating?: number;
  comments?: string;
}

interface BookWithAssociation extends Book {
  user_association?: UserAssociation;
}

interface BookTableProps {
  books: BookWithAssociation[];
}

export default function BookTable({ books }: BookTableProps) {
  const [userAssociations, setUserAssociations] = useState<Record<number, UserAssociation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  // Get user ID on client side only to avoid hydration mismatch
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
  }, []);

  useEffect(() => {
    if (userId !== null) {
      if (userId) {
        fetchUserAssociations();
      } else {
        setIsLoading(false);
      }
    }
  }, [userId]);

  const fetchUserAssociations = async () => {
    try {
      const response = await fetch(`/api/user-books?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const associationsMap: Record<number, UserAssociation> = {};
        data.books.forEach((book: any) => {
          if (book.user_association) {
            associationsMap[book.id] = book.user_association;
          }
        });
        setUserAssociations(associationsMap);
      }
    } catch (error) {
      console.error('Error fetching user associations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRowClick = (bookId: number) => {
    window.location.href = `/books/${bookId}`;
  };

  const getStatusBadge = (bookId: number) => {
    const association = userAssociations[bookId];
    if (!association) return null;

    const statusColors: Record<'unread' | 'reading' | 'read', string> = {
      unread: 'bg-gray-100 text-gray-800',
      reading: 'bg-blue-100 text-blue-800',
      read: 'bg-green-100 text-green-800'
    };

    const statusLabels: Record<'unread' | 'reading' | 'read', string> = {
      unread: 'Unread',
      reading: 'Reading',
      read: 'Read'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[association.read_status]}`}>
        {statusLabels[association.read_status]}
        {association.rating && (
          <span className="ml-1">⭐ {association.rating}</span>
        )}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50 group">
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer" 
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.title}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.author}
                </td>
                <td 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 cursor-pointer"
                  onClick={() => handleRowClick(book.id)}
                >
                  {book.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getStatusBadge(book.id)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <Link 
                    href={`/books/${book.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    View
                  </Link>
                  <Link 
                    href={`/books/${book.id}/edit`}
                    className="text-green-600 hover:text-green-900"
                  >
                    Edit
                  </Link>
                  <Link 
                    href={`/books/${book.id}/delete`}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 