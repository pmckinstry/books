import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedBookData {
  title?: string;
  author?: string;
  year?: number;
  description?: string;
  isbn?: string;
  page_count?: number;
  language?: string;
  publisher?: string;
  cover_image_url?: string;
  publication_date?: string;
  genres?: string[];
}

async function scrapeBookData(url: string): Promise<ScrapedBookData | null> {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    
    let title, author, description, year, isbn, page_count, cover_image_url, publisher;

    // Site-specific scraping
    if (hostname.includes('goodreads.com')) {
      // Goodreads specific selectors
      title = $('h1[data-testid="bookTitle"]').text().trim() ||
              $('h1.Text__title').text().trim() ||
              $('h1').first().text().trim();

      author = $('a[data-testid="name"]').first().text().trim() ||
               $('span.ContributorLinksList').first().text().trim() ||
               $('a.contributor').first().text().trim();

      description = $('span.Formatted').first().text().trim() ||
                    $('div[data-testid="description"]').text().trim() ||
                    $('div[class*="description"]').first().text().trim();

      // Extract year from publication info
      const pubInfo = $('p[data-testid="publicationInfo"]').text() ||
                      $('span[itemprop="datePublished"]').text();
      const yearMatch = pubInfo.match(/(\d{4})/);
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }

      // Extract ISBN
      const isbnText = $('p:contains("ISBN")').text() || $('span:contains("ISBN")').text();
      const isbnMatch = isbnText.match(/ISBN[^:]*:\s*(\d{10}|\d{13})/);
      if (isbnMatch) {
        isbn = isbnMatch[1];
      }

      // Extract page count
      const pagesText = $('p:contains("pages")').text() || $('span:contains("pages")').text();
      const pagesMatch = pagesText.match(/(\d+)\s*pages?/i);
      if (pagesMatch) {
        page_count = parseInt(pagesMatch[1]);
      }

      cover_image_url = $('img[data-testid="coverImage"]').attr('src') ||
                        $('img[class*="ResponsiveImage"]').first().attr('src');

      publisher = $('p:contains("Published by")').text().replace('Published by', '').trim() ||
                  $('span[itemprop="publisher"]').text().trim();

    } else if (hostname.includes('amazon.com')) {
      // Amazon specific selectors
      title = $('#productTitle').text().trim() ||
              $('h1[data-automation-id="title"]').text().trim() ||
              $('h1').first().text().trim();

      author = $('a[data-automation-id="contributor"]').first().text().trim() ||
               $('a:contains("by")').first().text().replace('by', '').trim() ||
               $('span[itemprop="author"]').first().text().trim();

      description = $('#bookDescription_feature_div').text().trim() ||
                    $('div[data-feature-name="bookDescription"]').text().trim() ||
                    $('div[class*="description"]').first().text().trim();

      // Extract year from publication info
      const pubInfo = $('span:contains("Publication date")').parent().text() ||
                      $('span[itemprop="datePublished"]').text();
      const yearMatch = pubInfo.match(/(\d{4})/);
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }

      // Extract ISBN
      const isbnText = $('span:contains("ISBN")').parent().text() || $('td:contains("ISBN")').next().text();
      const isbnMatch = isbnText.match(/ISBN[^:]*:\s*(\d{10}|\d{13})/);
      if (isbnMatch) {
        isbn = isbnMatch[1];
      }

      // Extract page count
      const pagesText = $('span:contains("pages")').parent().text() || $('td:contains("pages")').next().text();
      const pagesMatch = pagesText.match(/(\d+)\s*pages?/i);
      if (pagesMatch) {
        page_count = parseInt(pagesMatch[1]);
      }

      cover_image_url = $('#landingImage').attr('src') ||
                        $('img[data-old-hires]').attr('src');

      publisher = $('span:contains("Publisher")').parent().text().replace('Publisher', '').trim() ||
                  $('span[itemprop="publisher"]').text().trim();

    } else {
      // Generic fallback selectors
      title = $('h1').first().text().trim() || 
              $('title').text().trim();

      author = $('a[data-testid="name"]').first().text().trim() ||
               $('span[itemprop="author"]').first().text().trim() ||
               $('a.contributor').first().text().trim() ||
               $('a:contains("by")').first().text().replace('by', '').trim();

      description = $('div[data-testid="description"]').text().trim() ||
                    $('div.description').text().trim() ||
                    $('div[class*="description"]').first().text().trim();

      // Extract year from various patterns
      const yearText = $('p:contains("Published")').text() ||
                       $('span[itemprop="datePublished"]').text();
      const yearMatch = yearText.match(/(\d{4})/);
      if (yearMatch) {
        year = parseInt(yearMatch[1]);
      }

      // Extract ISBN
      const isbnText = $('p:contains("ISBN")').text() || $('span:contains("ISBN")').text();
      const isbnMatch = isbnText.match(/ISBN[^:]*:\s*(\d{10}|\d{13})/);
      if (isbnMatch) {
        isbn = isbnMatch[1];
      }

      // Extract page count
      const pagesText = $('p:contains("pages")').text() || $('span:contains("pages")').text();
      const pagesMatch = pagesText.match(/(\d+)\s*pages?/i);
      if (pagesMatch) {
        page_count = parseInt(pagesMatch[1]);
      }

      cover_image_url = $('img[class*="ResponsiveImage"]').first().attr('src') ||
                        $('img[data-testid="coverImage"]').attr('src') ||
                        $('img[alt*="cover"]').first().attr('src');

      publisher = $('p:contains("Published by")').text().replace('Published by', '').trim() ||
                  $('span[itemprop="publisher"]').text().trim();
    }

    // Clean up the data
    if (description && description.length > 500) {
      description = description.substring(0, 500) + '...';
    }

    if (author && author.includes('by')) {
      author = author.replace('by', '').trim();
    }

    // Convert year to publication_date if year is available but publication_date is not
    let publication_date = undefined;
    if (year && !publication_date) {
      publication_date = `${year}-01-01`; // Default to January 1st of the year
    }

    return {
      title,
      author,
      year,
      description,
      isbn,
      page_count,
      language: 'English',
      publisher,
      cover_image_url,
      publication_date,
      genres: ['Fiction']
    };
  } catch (error) {
    console.error('Error scraping book data:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Scrape the book data
    const bookData = await scrapeBookData(url);

    // Check if scraping was successful
    if (!bookData) {
      return NextResponse.json({ 
        error: 'Could not extract book information from the provided URL. Please try a different URL or manually enter the book details.' 
      }, { status: 400 });
    }

    // Validate that we got at least some basic data
    if (!bookData.title && !bookData.author) {
      return NextResponse.json({ 
        error: 'Could not extract book information from the provided URL. Please try a different URL or manually enter the book details.' 
      }, { status: 400 });
    }

    return NextResponse.json({ bookData });
  } catch (error) {
    console.error('Error scraping book data:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape book data. Please try again or manually enter the book details.' 
    }, { status: 500 });
  }
} 