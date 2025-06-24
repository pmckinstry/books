# URL Scraping Feature

## Overview

The URL scraping feature allows users to automatically extract book information from popular book websites by simply providing a URL. This feature streamlines the process of adding books to your personal collection.

## How to Use

1. Navigate to the Books page
2. Click the "Add from URL" button
3. Enter a URL from a supported book website
4. Click "Scrape Data" to extract book information
5. Review and edit the scraped data if needed
6. Click "Save Book" to add the book to your collection

## Supported Websites

Currently, the feature supports the following websites:

- **Goodreads** (goodreads.com) - Book reviews and recommendations
- **Amazon** (amazon.com) - Online bookstore
- **Barnes & Noble** (barnesandnoble.com) - Bookstore chain
- **Google Books** (books.google.com) - Google's book search service

## Extracted Information

The scraper attempts to extract the following book details:

- **Title** - Book title
- **Author** - Author name
- **Year** - Publication year
- **Description** - Book description/summary
- **ISBN** - International Standard Book Number
- **Page Count** - Number of pages
- **Language** - Book language (defaults to English)
- **Publisher** - Publishing company
- **Cover Image URL** - Book cover image
- **Publication Date** - Full publication date
- **Genres** - Book categories/genres

## Technical Implementation

### Frontend
- **Page**: `/books/add-with-url`
- **Component**: Client-side React component with form handling
- **Features**: 
  - URL validation
  - Loading states
  - Error handling
  - Editable scraped data
  - Success feedback

### Backend
- **API Endpoint**: `/api/books/scrape`
- **Method**: POST
- **Input**: JSON with `url` field
- **Output**: JSON with `bookData` object

### Scraping Logic
The current implementation uses mock data for demonstration purposes. In a production environment, you would implement:

1. **HTTP Requests**: Use libraries like `axios` or `fetch` with proper headers
2. **HTML Parsing**: Use `cheerio` for server-side HTML parsing
3. **Browser Automation**: Use `puppeteer` for JavaScript-heavy sites
4. **Rate Limiting**: Implement delays between requests
5. **Error Handling**: Handle network errors, parsing errors, and blocked requests

## Future Enhancements

### Additional Websites
- Book Depository
- Library of Congress
- WorldCat
- Open Library

### Advanced Features
- **Bulk Import**: Scrape multiple books at once
- **Smart Matching**: Match scraped books with existing entries
- **Cover Download**: Automatically download and store cover images
- **Metadata Enrichment**: Use external APIs (Google Books API, OpenLibrary API)
- **ISBN Validation**: Validate and format ISBNs
- **Duplicate Detection**: Check for existing books before adding

### Technical Improvements
- **Caching**: Cache scraped data to avoid repeated requests
- **Queue System**: Handle multiple scraping requests
- **User Agents**: Rotate user agents to avoid blocking
- **Proxy Support**: Use proxies for high-volume scraping
- **OCR for Covers**: Extract text from cover images

## Security Considerations

- **Input Validation**: Validate URLs to prevent SSRF attacks
- **Rate Limiting**: Prevent abuse of the scraping feature
- **User Authentication**: Ensure only authenticated users can scrape
- **Error Handling**: Don't expose sensitive information in error messages
- **CORS**: Configure proper CORS headers for cross-origin requests

## Legal Considerations

- **Terms of Service**: Respect each website's terms of service
- **Robots.txt**: Check and respect robots.txt files
- **Rate Limiting**: Implement reasonable delays between requests
- **Attribution**: Consider providing attribution for scraped data
- **Fair Use**: Ensure scraping falls under fair use guidelines

## Troubleshooting

### Common Issues

1. **"Failed to scrape book data"**
   - Check if the URL is from a supported website
   - Verify the URL is accessible
   - Try a different book URL

2. **"Invalid URL format"**
   - Ensure the URL includes the protocol (http:// or https://)
   - Check for typos in the URL

3. **"Could not extract book information"**
   - The website structure may have changed
   - Try manually entering the book details
   - Report the issue for investigation

### Debugging

- Check browser developer tools for network errors
- Verify the API endpoint is accessible
- Review server logs for detailed error information
- Test with known working URLs first

## Development Notes

The current implementation uses mock data to demonstrate the feature without requiring actual web scraping infrastructure. To implement real scraping:

1. Install required dependencies:
   ```bash
   npm install cheerio puppeteer axios
   ```

2. Update the scraping functions in `/api/books/scrape/route.ts`

3. Add proper error handling and rate limiting

4. Test with real URLs from supported websites

5. Monitor for changes in website structures that might break scraping 