This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- **User Authentication**: Register and login with username/password
- **Book Management**: Full CRUD operations for personal book collection
- **Reading Progress Tracking**: Mark books as unread, reading, or read
- **Book Ratings**: Rate books from 1-5 stars
- **Personal Comments**: Add notes and thoughts about books
- **SQLite Database**: Persistent data storage with better-sqlite3
- **REST API**: Complete API endpoints for books, authentication, and user associations
- **Pagination**: Browse books with paginated results
- **Responsive Design**: Modern UI with Tailwind CSS

## Authentication

The app includes user authentication with the following features:

- User registration with username and password
- Secure password hashing with bcrypt
- Login/logout functionality
- Protected routes requiring authentication
- Default admin user (username: `admin`, password: `admin123`)

## Database

The app uses SQLite with the following tables:

- **users**: User accounts with username and hashed password
- **books**: Book collection with title, author, year, description, and user association
- **user_book_associations**: User reading progress, ratings, and comments for books

## User-Book Associations

Users can track their reading progress with the following features:

- **Reading Status**: Mark books as "Unread", "Currently Reading", or "Read"
- **Ratings**: Rate books from 1-5 stars with visual star indicators
- **Comments**: Add personal notes and thoughts about books
- **Visual Indicators**: Status badges show reading progress in the book list
- **Personal Library**: Each user has their own reading history and preferences

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


---

## API Testing

### Authentication Endpoints

# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"newuser","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Logout
curl -X POST http://localhost:3000/api/auth/logout

### Book Endpoints

# Get all books
curl http://localhost:3000/api/books

# Get paginated books
curl http://localhost:3000/api/books?page=1&limit=10

# Get a specific book
curl http://localhost:3000/api/books/1

# Create a new book
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"New Book","author":"Author Name","year":2024}'

# Update a book
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete a book
curl -X DELETE http://localhost:3000/api/books/1

### User-Book Association Endpoints

# Get user's book associations (requires authentication)
curl http://localhost:3000/api/user-books

# Create or update a user-book association
curl -X POST http://localhost:3000/api/user-books \
  -H "Content-Type: application/json" \
  -d '{"book_id":1,"read_status":"reading","rating":4,"comments":"Great book so far!"}'

# Get user's association for a specific book
curl http://localhost:3000/api/user-books/1

# Update user's association for a specific book
curl -X PUT http://localhost:3000/api/user-books/1 \
  -H "Content-Type: application/json" \
  -d '{"read_status":"read","rating":5,"comments":"Excellent book! Highly recommended."}'

# Delete user's association for a specific book
curl -X DELETE http://localhost:3000/api/user-books/1
