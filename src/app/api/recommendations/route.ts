import { NextRequest, NextResponse } from 'next/server';
import { userBookAssociationOperations, bookOperations } from '@/lib/database-factory';
import { getUserIdFromRequest } from '@/lib/server-auth';

interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  genre?: string;
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    // If still no user, reject
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Recommendations API - Using userId:', userId);

    // Get user's read books with ratings and genres
    const userAssociations = await userBookAssociationOperations.getByUser(userId);
    console.log('Recommendations API - Total user associations found:', userAssociations.length);
    
    const readBooksPromises = userAssociations
      .filter(uba => uba.read_status === 'read')
      .map(async uba => {
        const book = await bookOperations.getById(uba.book_id);
        return book ? {
          ...book,
          rating: uba.rating,
          comments: uba.comments
        } : null;
      });
    
    const readBooks = (await Promise.all(readBooksPromises))
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
      if (Array.isArray(book.genres)) {
        book.genres.forEach(genre => {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });
      }
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
    // Use a more efficient approach by limiting the initial fetch
    const allBooks = await bookOperations.getAll(100); // Limit to 100 books for recommendations
    const readBookIds = new Set(readBooks.map(b => b.id));
    const recommendedBooks = allBooks.filter(b => !readBookIds.has(b.id));

    // Simple recommendation algorithm based on genre matching
    const recommendations: BookRecommendation[] = [];
    const seenTitles = new Set<string>();
    
    for (const book of recommendedBooks) {
      if (recommendations.length >= 10) break;
      if (seenTitles.has(book.title.toLowerCase())) continue;
      
      const bookGenres = Array.isArray(book.genres) ? book.genres.map(g => g.name) : [];
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
            genre: Array.isArray(book.genres) && book.genres.length > 0 ? book.genres[0].name : undefined
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
          genre: Array.isArray(book.genres) && book.genres.length > 0 ? book.genres[0].name : undefined
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
