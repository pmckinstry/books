import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations, bookOperations } from '@/lib/database';

interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  genre?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from request using the same pattern as other API routes
    const cookieHeader = request.headers.get('cookie');
    let userId: number | null = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      // Try to get user ID from a custom cookie
      if (cookies['user-id']) {
        userId = parseInt(cookies['user-id']);
      }
    }
    
    // Fallback: try to get from Authorization header
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // In a real app, you'd decode the JWT token here
        // For now, we'll use a simple approach
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
          userId = decoded.userId;
        } catch (e) {
          // Invalid token
        }
      }
    }
    
    // For now, if we can't get the user ID, we'll use a default
    // This should be replaced with proper authentication
    if (!userId) {
      // Return an error in production, but for demo purposes, use user ID 1
      console.warn('No user ID found in request, using default user ID 1');
      userId = 1;
    }

    console.log('Recommendations API - Using userId:', userId);

    // Get user's read books with ratings and genres
    const userAssociations = userBookAssociationOperations.getByUser(userId);
    console.log('Recommendations API - Total user associations found:', userAssociations.length);
    
    const readBooks = userAssociations
      .filter(uba => uba.read_status === 'read')
      .map(uba => {
        const book = bookOperations.getById(uba.book_id);
        return book ? {
          ...book,
          rating: uba.rating,
          comments: uba.comments
        } : null;
      })
      .filter(Boolean) as Array<{
        id: number;
        title: string;
        author: string;
        description?: string;
        genres: Array<{ id: number; name: string; description?: string }>;
        rating?: number;
        comments?: string;
      }>;

    console.log('Recommendations API - Read books found:', readBooks.length);

    if (readBooks.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'No reading history found. Start reading some books to get personalized recommendations!' 
      });
    }

    // Calculate user preferences
    const genreCounts: Record<string, number> = {};
    const authorCounts: Record<string, number> = {};
    let totalRating = 0;
    let ratedBooks = 0;

    readBooks.forEach(book => {
      book.genres.forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
      if (book.rating && book.rating > 0) {
        totalRating += book.rating;
        ratedBooks++;
      }
    });

    const averageRating = ratedBooks > 0 ? totalRating / ratedBooks : 0;
    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);
    const topAuthors = Object.entries(authorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([author]) => author);

    // Get all books and filter out those already read
    const allBooks = bookOperations.getAll();
    const readBookIds = new Set(readBooks.map(b => b.id));
    const recommendedBooks = allBooks.filter(b => !readBookIds.has(b.id));

    // Simple recommendation algorithm based on genre matching
    const recommendations: BookRecommendation[] = [];
    const seenTitles = new Set<string>();
    
    for (const book of recommendedBooks) {
      if (recommendations.length >= 10) break;
      if (seenTitles.has(book.title.toLowerCase())) continue;
      
      const bookGenres = book.genres.map(g => g.name);
      const genreMatches = bookGenres.filter(genre => topGenres.includes(genre));
      if (genreMatches.length > 0) {
        const reason = `Similar to your interest in ${genreMatches.join(', ')}`;
        recommendations.push({
          title: book.title,
          author: book.author,
          reason,
          genre: genreMatches[0]
        });
        seenTitles.add(book.title.toLowerCase());
      }
    }

    // If we don't have enough genre-based recommendations, add some author-based ones
    if (recommendations.length < 5) {
      for (const book of recommendedBooks) {
        if (recommendations.length >= 10) break;
        if (seenTitles.has(book.title.toLowerCase())) continue;
        
        if (topAuthors.includes(book.author)) {
          const reason = `By ${book.author}, an author you enjoy`;
          recommendations.push({
            title: book.title,
            author: book.author,
            reason,
            genre: book.genres[0]?.name
          });
          seenTitles.add(book.title.toLowerCase());
        }
      }
    }

    // Add some general recommendations if still not enough
    if (recommendations.length < 8) {
      for (const book of recommendedBooks) {
        if (recommendations.length >= 10) break;
        if (seenTitles.has(book.title.toLowerCase())) continue;
        
        const reason = "Popular book you might enjoy";
        recommendations.push({
          title: book.title,
          author: book.author,
          reason,
          genre: book.genres[0]?.name
        });
        seenTitles.add(book.title.toLowerCase());
      }
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, 10),
      userStats: {
        totalBooksRead: readBooks.length,
        averageRating: Math.round(averageRating * 10) / 10,
        topGenres,
        topAuthors
      }
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 