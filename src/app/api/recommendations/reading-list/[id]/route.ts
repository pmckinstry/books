import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations, bookOperations } from '@/lib/database-factory';

interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
  genre?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const readingListId = resolvedParams.id;

    // Get the reading list with its books
    const readingList = await (readingListOperations as any).getByIdWithBooks(readingListId);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    // Check if books array exists and has items
    if (!readingList.books || readingList.books.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'No books in this reading list yet. Add some books to get recommendations!' 
      });
    }

    // Analyze the books in this reading list
    const genreCounts: Record<string, number> = {};
    const authorCounts: Record<string, number> = {};
    const booksInList = new Set(readingList.books.map((b: any) => b.id));

    readingList.books.forEach((book: any) => {
      if (Array.isArray(book.genres)) {
        book.genres.forEach((genre: any) => {
          genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
        });
      }
      authorCounts[book.author] = (authorCounts[book.author] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);
    const topAuthors = Object.entries(authorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([author]) => author);

    // Get all books and filter out those already in the list
    const allBooks = await (bookOperations as any).getAll();
    const recommendedBooks = allBooks.filter((b: any) => !booksInList.has(b.id));

    // Simple recommendation algorithm based on genre matching
    const recommendations: BookRecommendation[] = [];
    const seenTitles = new Set<string>();
    
    for (const book of recommendedBooks) {
      if (recommendations.length >= 10) break;
      if (seenTitles.has(book.title.toLowerCase())) continue;
      
      const bookGenres = Array.isArray(book.genres) ? book.genres.map((g: any) => g.name) : [];
      const genreMatches = bookGenres.filter((genre: any) => topGenres.includes(genre));
      if (genreMatches.length > 0) {
        const reason = `Similar to the ${genreMatches.join(', ')} books in this list`;
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
          const reason = `By ${book.author}, an author featured in this list`;
          recommendations.push({
            title: book.title,
            author: book.author,
            reason,
            genre: Array.isArray(book.genres) && book.genres.length > 0 ? (book.genres[0] as any).name : undefined
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
        
        const reason = "Popular book that might fit this list";
        recommendations.push({
          title: book.title,
          author: book.author,
          reason,
          genre: Array.isArray(book.genres) && book.genres.length > 0 ? (book.genres[0] as any).name : undefined
        });
        seenTitles.add(book.title.toLowerCase());
      }
    }

    return NextResponse.json({
      recommendations: recommendations.slice(0, 10),
      listStats: {
        totalBooks: readingList.books.length,
        topGenres,
        topAuthors,
        listName: readingList.name
      }
    });

  } catch (error) {
    console.error('Error generating reading list recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
} 