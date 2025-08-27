# API Reference

The Book Manager application provides a comprehensive RESTful API for managing books, users, reading progress, and recommendations. All endpoints follow RESTful conventions and return JSON responses.

## Base URL
```
http://localhost:3000/api
```

## Authentication

### Register a New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123",
  "nickname": "My Nickname"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "newuser",
    "nickname": "My Nickname",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "username": "admin",
    "nickname": "Administrator"
  }
}
```

### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer {session_token}
```

**Response:**
```json
{
  "user": {
    "id": "1",
    "username": "admin",
    "nickname": "Administrator",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Logout
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Books Management

### Get Paginated Books
```http
GET /api/books?page=1&limit=10&search=gatsby&sortBy=title&sortOrder=asc
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for title, author, description, ISBN
- `sortBy` (optional): Sort field - title, author, created_at, isbn, page_count, language
- `sortOrder` (optional): asc or desc (default: desc)

**Response:**
```json
{
  "books": [
    {
      "id": "1",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "description": "A story of the fabulously wealthy Jay Gatsby...",
      "isbn": "978-0743273565",
      "page_count": 180,
      "language": "English",
      "publisher": "Scribner",
      "cover_image_url": "https://example.com/cover.jpg",
      "publication_date": "1925-04-10",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "genres": [
        {
          "id": "1",
          "name": "Classic",
          "description": "Timeless literary works"
        }
      ]
    }
  ],
  "total": 100,
  "totalPages": 10,
  "currentPage": 1
}
```

### Get Specific Book
```http
GET /api/books/{id}
```

**Response:**
```json
{
  "book": {
    "id": "1",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A story of the fabulously wealthy Jay Gatsby...",
    "isbn": "978-0743273565",
    "page_count": 180,
    "language": "English",
    "publisher": "Scribner",
    "cover_image_url": "https://example.com/cover.jpg",
    "publication_date": "1925-04-10",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "genres": [
      {
        "id": "1",
        "name": "Classic",
        "description": "Timeless literary works"
      }
    ]
  }
}
```

### Create a New Book
```http
POST /api/books
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "page_count": 180,
  "description": "A classic American novel",
  "language": "English",
  "publisher": "Scribner",
  "cover_image_url": "https://example.com/cover.jpg",
  "publication_date": "1925-04-10",
  "genres": ["1", "2"]
}
```

**Response:**
```json
{
  "success": true,
  "book": {
    "id": "123",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "978-0743273565",
    "page_count": 180,
    "description": "A classic American novel",
    "language": "English",
    "publisher": "Scribner",
    "cover_image_url": "https://example.com/cover.jpg",
    "publication_date": "1925-04-10",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "genres": [
      {
        "id": "1",
        "name": "Classic",
        "description": "Timeless literary works"
      }
    ]
  }
}
```

### Update Book
```http
PUT /api/books/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "genres": ["1", "3"]
}
```

### Delete Book
```http
DELETE /api/books/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Book deleted successfully"
}
```

### Scrape Book Data from URL
```http
POST /api/books/scrape
Content-Type: application/json

{
  "url": "https://www.goodreads.com/book/show/4671.The_Great_Gatsby"
}
```

**Response:**
```json
{
  "success": true,
  "bookData": {
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A story of the fabulously wealthy Jay Gatsby...",
    "isbn": "978-0743273565",
    "cover_image_url": "https://example.com/cover.jpg",
    "publication_date": "1925-04-10"
  }
}
```

## Reading Progress

### Get User's Reading Associations
```http
GET /api/user-books?page=1&limit=10&sortBy=updated_at&sortOrder=desc
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sortBy` (optional): Sort field - title, author, updated_at, isbn, page_count, language
- `sortOrder` (optional): asc or desc (default: desc)
- `search` (optional): Search term

**Response:**
```json
{
  "books": [
    {
      "id": "1",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "user_association": {
        "id": "123",
        "user_id": "1",
        "book_id": "1",
        "read_status": "read",
        "rating": 5,
        "comments": "Absolutely loved this book!",
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "total": 25,
  "totalPages": 3,
  "currentPage": 1
}
```

### Update Reading Status and Rating
```http
POST /api/user-books
Content-Type: application/json

{
  "book_id": "1",
  "read_status": "read",
  "rating": 5,
  "comments": "Absolutely loved this book!"
}
```

**Response:**
```json
{
  "success": true,
  "association": {
    "id": "123",
    "user_id": "1",
    "book_id": "1",
    "read_status": "read",
    "rating": 5,
    "comments": "Absolutely loved this book!",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Read Books Only
```http
GET /api/user-books/read?search=gatsby&page=1&limit=10
```

**Response:**
```json
{
  "books": [
    {
      "id": "1",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "genres": [],
      "user_association": {
        "read_status": "read",
        "rating": 5,
        "comments": "Excellent read!"
      }
    }
  ],
  "total": 15,
  "totalPages": 2,
  "currentPage": 1
}
```

## Genres

### Get All Genres
```http
GET /api/genres
```

**Response:**
```json
{
  "genres": [
    {
      "id": "1",
      "name": "Classic",
      "description": "Timeless literary works that have stood the test of time"
    },
    {
      "id": "2",
      "name": "Science Fiction",
      "description": "Fiction that explores futuristic concepts and advanced technology"
    }
  ]
}
```

### Get Specific Genre
```http
GET /api/genres/{id}
```

### Create Genre
```http
POST /api/genres
Content-Type: application/json

{
  "name": "Mystery",
  "description": "Stories involving puzzles, crimes, or unexplained events"
}
```

### Update Genre
```http
PUT /api/genres/{id}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

### Delete Genre
```http
DELETE /api/genres/{id}
```

## Reading Lists

### Get User's Reading Lists
```http
GET /api/reading-lists
```

**Response:**
```json
{
  "readingLists": [
    {
      "id": "1",
      "name": "Summer Reading 2024",
      "description": "Books to read this summer",
      "is_public": false,
      "user_id": "1",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Reading List with Books
```http
GET /api/reading-lists/{id}
```

**Response:**
```json
{
  "readingList": {
    "id": "1",
    "name": "Summer Reading 2024",
    "description": "Books to read this summer",
    "is_public": false,
    "user_id": "1",
    "books": [
      {
        "id": "1",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "reading_list_book": {
          "id": "123",
          "reading_list_id": "1",
          "book_id": "1",
          "position": 1,
          "notes": "Recommended by friend",
          "added_at": "2024-01-01T00:00:00.000Z"
        }
      }
    ],
    "book_count": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Create a Reading List
```http
POST /api/reading-lists
Content-Type: application/json

{
  "name": "Summer Reading 2024",
  "description": "Books to read this summer",
  "is_public": false
}
```

### Update Reading List
```http
PUT /api/reading-lists/{id}
Content-Type: application/json

{
  "name": "Updated List Name",
  "description": "Updated description",
  "is_public": true
}
```

### Delete Reading List
```http
DELETE /api/reading-lists/{id}
```

### Add Book to Reading List
```http
POST /api/reading-lists/{id}/books
Content-Type: application/json

{
  "book_id": "5",
  "notes": "Recommended by friend",
  "position": 1
}
```

### Remove Book from Reading List
```http
DELETE /api/reading-lists/{listId}/books/{bookId}
```

### Update Book in Reading List
```http
PUT /api/reading-lists/{listId}/books/{bookId}
Content-Type: application/json

{
  "position": 2,
  "notes": "Updated notes"
}
```

## Recommendations

### Get Recommendations Based on Reading History
```http
GET /api/recommendations
```

**Response:**
```json
{
  "recommendations": [
    {
      "source": "reading_history",
      "books": [
        {
          "title": "Similar Book",
          "author": "Similar Author",
          "reason": "Based on your interest in Classic literature"
        }
      ]
    }
  ]
}
```

### Get TasteDive Recommendations
```http
GET /api/recommendations/tastedive?query=science+fiction
```

**Query Parameters:**
- `query` (required): Search query for recommendations

### Get Google Books Recommendations
```http
GET /api/recommendations/google-books?query=fantasy+novels
```

**Query Parameters:**
- `query` (required): Search query for recommendations

### Get Recommendations for a Reading List
```http
GET /api/recommendations/reading-list/{id}
```

**Response:**
```json
{
  "recommendations": [
    {
      "source": "reading_list",
      "books": [
        {
          "title": "Recommended Book",
          "author": "Recommended Author",
          "description": "Description of the book",
          "reason": "Based on books in your 'Summer Reading 2024' list"
        }
      ]
    }
  ]
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **General endpoints**: 100 requests per minute per IP
- **Authentication endpoints**: 10 requests per minute per IP
- **Scraping endpoints**: 5 requests per minute per IP

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Database Considerations

The API supports multiple database backends (SQLite, DynamoDB) with consistent interfaces. Some considerations:

- **ID Format**: SQLite uses integer IDs, while DynamoDB uses string UUIDs
- **Pagination**: Pagination implementation may vary between databases
- **Search**: Full-text search capabilities depend on the database backend


## Testing

Use the provided test files in `src/__tests__/api/` as examples of API usage. Run tests with:

```bash
npm test
```

For interactive API testing, consider using tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)

## Source Code

For complete implementation details, see the API route handlers in the [`src/app/api/`](../src/app/api/) directory.