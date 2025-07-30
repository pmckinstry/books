# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack for fast reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Testing
- `npm test` or `npm run test:run` - Run all tests with Vitest
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:ui` - Run tests with Vitest UI for interactive testing

### Single Test Execution
To run a specific test file: `npx vitest run src/__tests__/api/books.test.ts`
To run tests matching a pattern: `npx vitest run --reporter=verbose --grep="GET /api/books"`

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.3.4 with React 19, TypeScript, and Tailwind CSS 4
- **Backend**: Next.js API Routes with RESTful design
- **Database**: SQLite with better-sqlite3 for local storage
- **Authentication**: Custom secure system with bcrypt password hashing
- **Testing**: Vitest with jsdom environment and comprehensive API coverage

### Core Application Structure

#### Database Layer (`src/lib/database.ts`)
- Manages SQLite database initialization and operations
- Contains all database schemas and migrations
- Core tables: `users`, `books`, `genres`, `user_book_associations`, `reading_lists`, `book_genres`, `reading_list_books`
- Database file located at `data/books.db` (auto-created)

#### Authentication System
- **Client-side**: `src/lib/auth.ts` - localStorage-based session management with 7-day expiration
- **Server-side**: `src/lib/server-auth.ts` - secure session validation for API routes
- Default admin credentials: username `admin`, password `admin123`

#### API Architecture (`src/app/api/`)
All API routes follow RESTful conventions:
- **Authentication**: `/api/auth/*` - login, logout, register, profile
- **Books**: `/api/books/*` - CRUD operations, search, URL scraping
- **Genres**: `/api/genres/*` - genre management
- **User Books**: `/api/user-books/*` - reading progress, ratings, comments
- **Reading Lists**: `/api/reading-lists/*` - custom book lists
- **Recommendations**: `/api/recommendations/*` - TasteDive and Google Books integration

#### Key Features Architecture

**Book Management**: Complete CRUD with URL scraping capability using Cheerio for extracting book data from websites. Books support multiple genres through many-to-many relationships.

**Reading Progress Tracking**: User-book associations store reading status (unread/reading/read), 1-5 star ratings, and personal comments. Dedicated "read books" view available.

**Genre Organization**: Books can belong to multiple genres. Pre-loaded with 15+ popular genres. Full CRUD for custom genres.

**Reading Lists**: Users can create public/private reading lists, add/remove books with notes, and get recommendations based on list contents.

**External Integrations**: TasteDive and Google Books APIs for book recommendations (API keys configurable via environment variables).

### Component Architecture (`src/components/`)
- Modular React components following Next.js 15 patterns
- Form components with validation (CreateBookForm, EditBookForm, etc.)
- Table components with pagination, search, and sorting
- Authentication components (AuthGuard, LoginForm, RegisterForm)
- Recommendation components for external API integration

### Database Schema Design
The application uses a well-normalized relational schema:
- **users**: Secure user accounts with bcrypt hashing
- **books**: Core book information with metadata (ISBN, page count, cover images)
- **genres**: Book categorization system
- **user_book_associations**: Reading progress, ratings, and personal notes
- **reading_lists**: Custom book collections with public/private settings
- **book_genres**: Many-to-many relationship between books and genres
- **reading_list_books**: Books within lists with positioning and notes

### State Management
- No global state management library - uses React's built-in state and server state
- Authentication state managed through localStorage with automatic expiration
- API calls centralized in `src/lib/api.ts` for consistent error handling

### Testing Strategy
- Comprehensive test coverage for all API endpoints in `src/__tests__/api/`
- Tests use in-memory SQLite database for isolation
- Mock authentication and external API calls
- Focus on API contract testing and business logic validation

## Development Guidelines

### Adding New Features
1. Create database schema changes in `src/lib/database.ts`
2. Implement API endpoints in `src/app/api/`
3. Add corresponding tests in `src/__tests__/api/`
4. Create necessary components in `src/components/`
5. Add pages in `src/app/` following Next.js 15 App Router patterns

### Database Migrations
- Migration scripts located in `scripts/` directory
- Use TypeScript for database operations
- Always backup `data/books.db` before running migrations

### Authentication Integration
- Protect API routes using `getServerUser()` from `src/lib/server-auth.ts`
- Use `AuthGuard` component for client-side route protection
- Check authentication state with `getCurrentUser()` from `src/lib/auth.ts`

### Code Style
- ESLint configuration extends Next.js core-web-vitals and TypeScript rules
- Use TypeScript strict mode
- Follow existing component patterns and naming conventions
- Prefer server components over client components when possible

### External API Integration
- TasteDive API for book recommendations (set `TASTEDIVE_API_KEY`)
- Google Books API for book data and recommendations (set `GOOGLE_BOOKS_API_KEY`)
- APIs are optional - application works without them

## Important Implementation Details

### URL Scraping Feature
- Located in `/api/books/scrape` endpoint
- Uses Cheerio for HTML parsing
- Supports popular book sites for metadata extraction
- Includes duplicate prevention logic

### Search and Filtering
- Full-text search across title, author, ISBN, and description
- Genre-based filtering with multi-select support
- Sorting by title, author, publication date, page count, language
- Pagination for large collections

### Reading Lists Functionality
- Support for public/private lists
- Books can be added with position and notes
- Drag-and-drop reordering (client-side)
- Recommendations based on list contents

### Performance Considerations
- Database queries optimized with proper indexing
- Pagination implemented for all list views
- Image optimization for book covers
- SQLite provides excellent performance for single-user scenarios