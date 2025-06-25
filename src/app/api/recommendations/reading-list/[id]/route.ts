import { NextRequest, NextResponse } from 'next/server';
import { readingListOperations, bookOperations } from '@/lib/database';

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
    const readingListId = parseInt(resolvedParams.id);
    
    if (isNaN(readingListId)) {
      return NextResponse.json({ error: 'Invalid reading list ID' }, { status: 400 });
    }

    // Get the reading list with its books
    const readingList = readingListOperations.getByIdWithBooks(readingListId);
    if (!readingList) {
      return NextResponse.json({ error: 'Reading list not found' }, { status: 404 });
    }

    if (readingList.books.length === 0) {
      return NextResponse.json({ 
        recommendations: [],
        message: 'No books in this reading list yet. Add some books to get recommendations!' 
      });
    }

    // Analyze the books in this reading list
    const genreCounts: Record<string, number> = {};
    const authorCounts: Record<string, number> = {};
    const booksInList = new Set(readingList.books.map(b => b.id));

    readingList.books.forEach(book => {
      book.genres.forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
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
    const allBooks = bookOperations.getAll();
    const recommendedBooks = allBooks.filter(b => !booksInList.has(b.id));

    // Simple recommendation algorithm based on genre matching
    const recommendations: BookRecommendation[] = [];
    const seenTitles = new Set<string>();
    
    for (const book of recommendedBooks) {
      if (recommendations.length >= 10) break;
      if (seenTitles.has(book.title.toLowerCase())) continue;
      
      const bookGenres = book.genres.map(g => g.name);
      const genreMatches = bookGenres.filter(genre => topGenres.includes(genre));
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
        
        const reason = "Popular book that might fit this list";
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