import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface TasteDiveRecommendation {
  title: string;
  author?: string;
  reason: string;
  genre?: string;
  type: 'book';
  wTeaser?: string;
  wUrl?: string;
  yUrl?: string;
  yID?: string;
}

interface TasteDiveResponse {
  similar: {
    info: Array<{
      name: string;
      type: string;
    }>;
    results: Array<{
      name: string;
      type?: string;
      wTeaser?: string;
      wUrl?: string;
      yUrl?: string;
      yID?: string;
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookTitle = searchParams.get('title');
    const author = searchParams.get('author');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    if (!bookTitle) {
      return NextResponse.json(
        { error: 'Book title is required' },
        { status: 400 }
      );
    }

    // TasteDive API configuration
    const TASTEDIVE_API_KEY = '1053032-library-1E6A48BC';
    const TASTEDIVE_BASE_URL = 'https://tastedive.com/api/similar';

    // Construct the query - TasteDive works best with "Title by Author" format
    const query = author ? `${bookTitle} by ${author}` : bookTitle;

    const params = new URLSearchParams({
      q: query,
      type: 'book',
      limit: limit.toString(),
      k: TASTEDIVE_API_KEY
    });

    console.log('TasteDive API request:', `${TASTEDIVE_BASE_URL}?${params.toString()}`);

    const response = await axios.get<TasteDiveResponse>(`${TASTEDIVE_BASE_URL}?${params.toString()}`);

    if (!response.data.similar || !response.data.similar.results) {
      return NextResponse.json({
        recommendations: [],
        message: 'No recommendations found from TasteDive'
      });
    }

    // Transform TasteDive results into our format
    const recommendations: TasteDiveRecommendation[] = response.data.similar.results
      .filter(result => !result.type || result.type === 'book')
      .map(result => ({
        title: result.name,
        reason: `Recommended based on "${bookTitle}"`,
        type: 'book' as const,
        wTeaser: result.wTeaser,
        wUrl: result.wUrl,
        yUrl: result.yUrl,
        yID: result.yID
      }));

    return NextResponse.json({
      recommendations: recommendations.slice(0, limit),
      source: 'TasteDive',
      originalQuery: query
    });

  } catch (error) {
    console.error('Error fetching TasteDive recommendations:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: 'No recommendations found for this book' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch recommendations from TasteDive' },
      { status: 500 }
    );
  }
} 