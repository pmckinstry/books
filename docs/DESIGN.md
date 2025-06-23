# Book Manager - Design Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [User Experience Design](#user-experience-design)
4. [Technical Implementation](#technical-implementation)
5. [Database Design](#database-design)
6. [API Design](#api-design)
7. [Component Architecture](#component-architecture)
8. [Authentication & Security](#authentication--security)
9. [Styling & UI/UX](#styling--uiux)
10. [Performance Considerations](#performance-considerations)
11. [Future Enhancements](#future-enhancements)

## Project Overview

### Purpose
Book Manager is a personal book collection management application that allows users to:
- Maintain a personal library of books
- Track reading progress (unread, reading, read)
- Rate and review books
- Organize books by genres
- Search and filter their collection
- Manage reading history and preferences

### Target Users
- Individual readers who want to track their personal reading
- Book enthusiasts who want to maintain a digital library
- Users who want to rate and review books they've read
- People who want to discover new books through genre exploration

### Key Features
- **User Authentication**: Secure login/registration system
- **Book Management**: Full CRUD operations for books
- **Reading Progress Tracking**: Mark books as unread, reading, or read
- **Rating System**: 1-5 star rating with visual indicators
- **Personal Comments**: Add notes and thoughts about books
- **Genre Organization**: Categorize books by genres
- **Search & Filter**: Find books by title, author, year, or genre
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

### Technology Stack
- **Frontend**: Next.js 15.3.4 with React 19
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS 4
- **Authentication**: Custom JWT-like system with localStorage
- **Language**: TypeScript
- **Development**: ESLint, Turbopack

### Project Structure
```
books/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API endpoints
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── books/         # Book management endpoints
│   │   │   ├── genres/        # Genre management endpoints
│   │   │   └── user-books/    # User-book associations
│   │   ├── books/             # Book pages
│   │   ├── genres/            # Genre pages
│   │   ├── profile/           # User profile
│   │   ├── read/              # Read books list
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable React components
│   └── lib/                   # Utility libraries
│       ├── auth.ts            # Authentication utilities
│       ├── database.ts        # Database operations
│       └── api.ts             # API client utilities
├── data/                      # SQLite database files
├── public/                    # Static assets
└── scripts/                   # Database migration scripts
```

### Design Patterns
- **Component-Based Architecture**: Modular React components
- **Server-Side Rendering**: Next.js App Router for SEO and performance
- **API-First Design**: RESTful API endpoints
- **Database-First**: SQLite schema-driven development
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## User Experience Design

### User Journey

#### 1. Onboarding
1. **Landing Page**: Introduction to the application
2. **Registration**: Create account with username/password
3. **First Login**: Welcome experience
4. **Initial Setup**: Optional profile customization

#### 2. Book Discovery
1. **Browse All Books**: Paginated list with search/filter
2. **Genre Exploration**: Browse books by category
3. **Search Functionality**: Find books by title, author, year
4. **Book Details**: View comprehensive book information

#### 3. Reading Management
1. **Add to Library**: Mark books for reading
2. **Track Progress**: Update reading status
3. **Rate & Review**: Add ratings and comments
4. **Reading History**: View completed books

#### 4. Personal Library
1. **Reading List**: Currently reading books
2. **Read Books**: Completed books with ratings
3. **Wishlist**: Books marked as unread
4. **Personal Stats**: Reading statistics and insights

### User Interface Principles

#### 1. Simplicity
- Clean, uncluttered interface
- Minimal cognitive load
- Clear visual hierarchy
- Intuitive navigation

#### 2. Consistency
- Uniform design language
- Consistent color scheme
- Standardized component patterns
- Predictable interactions

#### 3. Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios
- Responsive design for all devices

#### 4. Feedback
- Loading states for all operations
- Success/error notifications
- Visual confirmation of actions
- Progress indicators

### Information Architecture

#### Navigation Structure
```
Home
├── Books
│   ├── All Books
│   ├── Create Book
│   └── Book Details
├── Genres
│   ├── All Genres
│   ├── Create Genre
│   └── Genre Details
├── Read Books
├── Profile
└── Authentication
    ├── Login
    └── Register
```

#### Content Organization
- **Books**: Primary content with metadata
- **Genres**: Categorization system
- **User Associations**: Personal reading data
- **User Profiles**: Account management

## Technical Implementation

### Frontend Architecture

#### Component Hierarchy
```
App Layout
├── Navigation
├── AuthGuard (Protected Routes)
├── Page Components
│   ├── BookList
│   ├── BookDetail
│   ├── GenreList
│   └── UserProfile
└── Reusable Components
    ├── BookTable
    ├── BookSearch
    ├── Pagination
    └── Forms
```

#### State Management
- **Local State**: React useState for component-specific state
- **URL State**: Search params for filters and pagination
- **Authentication State**: localStorage for user sessions
- **Server State**: API calls for data fetching

#### Data Flow
1. **User Action**: Click, form submission, navigation
2. **Component Handler**: Event handlers in components
3. **API Call**: Fetch data from backend
4. **State Update**: Update component state
5. **UI Re-render**: Reflect changes in interface

### Backend Architecture

#### API Design Pattern
- **RESTful Endpoints**: Standard HTTP methods
- **Resource-Based URLs**: `/api/books`, `/api/genres`
- **Consistent Response Format**: JSON with status codes
- **Error Handling**: Standardized error responses

#### Authentication Flow
1. **Registration**: Create user account
2. **Login**: Authenticate and create session
3. **Token Management**: JWT-like tokens in localStorage
4. **Route Protection**: Guard protected routes
5. **Logout**: Clear session data

#### Database Operations
- **Connection Management**: Singleton database instance
- **Prepared Statements**: SQL injection prevention
- **Transaction Support**: Data consistency
- **Error Handling**: Graceful failure handling

## Database Design

### Schema Overview

#### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nickname TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

#### Books Table
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  year INTEGER,
  description TEXT,
  user_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
)
```

#### User Book Associations Table
```sql
CREATE TABLE user_book_associations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  read_status TEXT DEFAULT 'unread' CHECK (read_status IN ('unread', 'reading', 'read')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comments TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
  UNIQUE(user_id, book_id)
)
```

#### Genres Table
```sql
CREATE TABLE genres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  description TEXT
)
```

#### Book Genres Junction Table
```sql
CREATE TABLE book_genres (
  book_id INTEGER NOT NULL,
  genre_id INTEGER NOT NULL,
  PRIMARY KEY (book_id, genre_id),
  FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres (id) ON DELETE CASCADE
)
```

### Data Relationships
- **One-to-Many**: User → Books (creator relationship)
- **Many-to-Many**: Books ↔ Genres (categorization)
- **One-to-One**: User ↔ Book (reading association)
- **Cascade Deletes**: Maintain referential integrity

### Indexing Strategy
- **Primary Keys**: Auto-incrementing IDs
- **Unique Constraints**: Username, book-genre pairs
- **Foreign Keys**: User and book references
- **Search Optimization**: Title and author fields

## API Design

### Authentication Endpoints

#### POST /api/auth/register
- **Purpose**: Create new user account
- **Request Body**: `{ username, password, nickname? }`
- **Response**: `{ success: boolean, user?: User, error?: string }`

#### POST /api/auth/login
- **Purpose**: Authenticate user
- **Request Body**: `{ username, password }`
- **Response**: `{ success: boolean, user?: User, error?: string }`

#### POST /api/auth/logout
- **Purpose**: End user session
- **Response**: `{ success: boolean }`

### Book Endpoints

#### GET /api/books
- **Purpose**: Retrieve paginated book list
- **Query Parameters**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ books: Book[], totalPages: number, total: number }`

#### GET /api/books/[id]
- **Purpose**: Get specific book details
- **Response**: `{ book: BookWithGenres }`

#### POST /api/books
- **Purpose**: Create new book
- **Request Body**: `{ title, author, year, description?, genres? }`
- **Response**: `{ success: boolean, book?: Book, error?: string }`

#### PUT /api/books/[id]
- **Purpose**: Update existing book
- **Request Body**: `{ title?, author?, year?, description? }`
- **Response**: `{ success: boolean, book?: Book, error?: string }`

#### DELETE /api/books/[id]
- **Purpose**: Delete book
- **Response**: `{ success: boolean, error?: string }`

### User-Book Association Endpoints

#### GET /api/user-books
- **Purpose**: Get user's book associations
- **Query Parameters**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ books: BookWithAssociation[], totalPages: number, total: number }`

#### GET /api/user-books/read
- **Purpose**: Get user's read books
- **Query Parameters**: `page`, `limit`, `search`, `sortBy`, `sortOrder`
- **Response**: `{ books: BookWithAssociation[], totalPages: number, total: number }`

#### POST /api/user-books
- **Purpose**: Create/update user-book association
- **Request Body**: `{ book_id, read_status?, rating?, comments? }`
- **Response**: `{ success: boolean, association?: UserBookAssociation, error?: string }`

#### PUT /api/user-books/[bookId]
- **Purpose**: Update user's association for specific book
- **Request Body**: `{ read_status?, rating?, comments? }`
- **Response**: `{ success: boolean, association?: UserBookAssociation, error?: string }`

#### DELETE /api/user-books/[bookId]
- **Purpose**: Remove user's association with book
- **Response**: `{ success: boolean, error?: string }`

### Genre Endpoints

#### GET /api/genres
- **Purpose**: Get all genres
- **Response**: `{ genres: Genre[] }`

#### GET /api/genres/[id]
- **Purpose**: Get specific genre with books
- **Response**: `{ genre: Genre, books: Book[] }`

#### POST /api/genres
- **Purpose**: Create new genre
- **Request Body**: `{ name, description? }`
- **Response**: `{ success: boolean, genre?: Genre, error?: string }`

#### PUT /api/genres/[id]
- **Purpose**: Update existing genre
- **Request Body**: `{ name?, description? }`
- **Response**: `{ success: boolean, genre?: Genre, error?: string }`

#### DELETE /api/genres/[id]
- **Purpose**: Delete genre
- **Response**: `{ success: boolean, error?: string }`

## Component Architecture

### Core Components

#### Navigation Component
- **Purpose**: Global navigation bar
- **Features**: 
  - Responsive design
  - Authentication state management
  - Dynamic menu items
  - User profile display

#### AuthGuard Component
- **Purpose**: Protect routes requiring authentication
- **Features**:
  - Route protection
  - Redirect to login
  - Loading states
  - Error handling

#### BookTable Component
- **Purpose**: Display books in tabular format
- **Features**:
  - Sortable columns
  - Pagination
  - Search functionality
  - Clickable rows
  - Status indicators

#### BookSearch Component
- **Purpose**: Search and filter books
- **Features**:
  - Real-time search
  - Multiple filter options
  - Search history
  - Clear filters

#### Pagination Component
- **Purpose**: Navigate through paginated results
- **Features**:
  - Page navigation
  - Items per page selection
  - Page number display
  - Previous/next buttons

### Form Components

#### CreateBookForm
- **Purpose**: Add new books to collection
- **Features**:
  - Form validation
  - Genre selection
  - File upload support
  - Success/error feedback

#### EditBookForm
- **Purpose**: Modify existing book information
- **Features**:
  - Pre-populated fields
  - Validation
  - Cancel/save options
  - Confirmation dialogs

#### UserBookAssociation Component
- **Purpose**: Manage reading progress and ratings
- **Features**:
  - Status selection
  - Star rating system
  - Comments field
  - Auto-save functionality

### Utility Components

#### LoadingSpinner
- **Purpose**: Show loading states
- **Features**:
  - Animated spinner
  - Customizable size
  - Loading text
  - Overlay support

#### ErrorBoundary
- **Purpose**: Handle component errors
- **Features**:
  - Error catching
  - Fallback UI
  - Error reporting
  - Recovery options

## Authentication & Security

### Authentication Strategy

#### Token-Based Authentication
- **Implementation**: Custom JWT-like tokens
- **Storage**: localStorage for persistence
- **Validation**: Server-side token verification
- **Expiration**: Configurable token lifetime

#### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Validation**: Strong password requirements
- **Storage**: Hashed passwords only
- **Reset**: Password reset functionality (future)

#### Session Management
- **Creation**: On successful login
- **Validation**: On each protected request
- **Termination**: On logout or expiration
- **Refresh**: Automatic token refresh (future)

### Security Measures

#### Input Validation
- **Client-Side**: Form validation with HTML5 and custom rules
- **Server-Side**: API endpoint validation
- **SQL Injection**: Prepared statements
- **XSS Prevention**: Content sanitization

#### Route Protection
- **Middleware**: Authentication checks
- **Redirects**: Unauthorized access handling
- **Role-Based**: User permission system (future)
- **Rate Limiting**: API request throttling (future)

#### Data Protection
- **Encryption**: Sensitive data encryption
- **Backup**: Regular database backups
- **Audit Logs**: User action tracking (future)
- **GDPR Compliance**: Data privacy measures (future)

## Styling & UI/UX

### Design System

#### Color Palette
- **Primary**: Blue (#3B82F6) - Links, buttons, highlights
- **Secondary**: Gray (#6B7280) - Text, borders, backgrounds
- **Success**: Green (#10B981) - Success states, confirmations
- **Warning**: Yellow (#F59E0B) - Warnings, alerts
- **Error**: Red (#EF4444) - Errors, deletions
- **Background**: Light gray (#F9FAFB) - Page backgrounds

#### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Font Sizes**: 
  - xs: 0.75rem (12px)
  - sm: 0.875rem (14px)
  - base: 1rem (16px)
  - lg: 1.125rem (18px)
  - xl: 1.25rem (20px)
  - 2xl: 1.5rem (24px)
  - 3xl: 1.875rem (30px)

#### Spacing System
- **Base Unit**: 0.25rem (4px)
- **Common Spacings**:
  - 1: 0.25rem (4px)
  - 2: 0.5rem (8px)
  - 4: 1rem (16px)
  - 6: 1.5rem (24px)
  - 8: 2rem (32px)
  - 12: 3rem (48px)
  - 16: 4rem (64px)

### Component Styling

#### Button Styles
```css
/* Primary Button */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors;
}

/* Secondary Button */
.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors;
}

/* Danger Button */
.btn-danger {
  @apply bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors;
}
```

#### Form Styles
```css
/* Input Fields */
.form-input {
  @apply px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
}

/* Form Labels */
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

/* Form Groups */
.form-group {
  @apply mb-4;
}
```

#### Table Styles
```css
/* Table Container */
.table-container {
  @apply bg-white shadow rounded-lg overflow-hidden;
}

/* Table Headers */
.table-header {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

/* Table Cells */
.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}

/* Table Rows */
.table-row {
  @apply hover:bg-gray-50 transition-colors duration-150 cursor-pointer;
}
```

### Responsive Design

#### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

#### Mobile-First Approach
- **Base Styles**: Mobile-first design
- **Progressive Enhancement**: Add features for larger screens
- **Touch-Friendly**: Large touch targets
- **Readable Text**: Minimum 16px font size

#### Responsive Patterns
- **Flexible Grid**: CSS Grid and Flexbox
- **Collapsible Navigation**: Mobile hamburger menu
- **Stacked Layouts**: Vertical stacking on mobile
- **Hidden Elements**: Show/hide based on screen size

## Performance Considerations

### Frontend Performance

#### Code Splitting
- **Route-Based**: Next.js automatic code splitting
- **Component-Based**: Lazy loading of heavy components
- **Bundle Optimization**: Tree shaking and minification
- **Caching**: Static asset caching

#### Image Optimization
- **Next.js Image**: Automatic optimization
- **Lazy Loading**: Images load as needed
- **Responsive Images**: Different sizes for different devices
- **WebP Format**: Modern image format support

#### State Management
- **Minimal Re-renders**: Optimized component updates
- **Memoization**: React.memo for expensive components
- **Debouncing**: Search input debouncing
- **Caching**: API response caching

### Backend Performance

#### Database Optimization
- **Indexing**: Strategic database indexes
- **Query Optimization**: Efficient SQL queries
- **Connection Pooling**: Database connection management
- **Caching**: Query result caching

#### API Performance
- **Pagination**: Limit result sets
- **Filtering**: Server-side filtering
- **Sorting**: Database-level sorting
- **Compression**: Response compression

#### Caching Strategy
- **Static Assets**: Long-term caching
- **API Responses**: Short-term caching
- **Database Queries**: Query result caching
- **User Sessions**: Session caching

### Monitoring & Analytics

#### Performance Metrics
- **Page Load Time**: Core Web Vitals
- **Time to Interactive**: User interaction readiness
- **First Contentful Paint**: Visual loading
- **Largest Contentful Paint**: Main content loading

#### Error Tracking
- **Client Errors**: JavaScript error monitoring
- **Server Errors**: API error logging
- **User Feedback**: Error reporting system
- **Performance Alerts**: Threshold monitoring

## Future Enhancements

### Planned Features

#### Advanced Search
- **Full-Text Search**: Elasticsearch integration
- **Advanced Filters**: Multiple criteria filtering
- **Search Suggestions**: Autocomplete functionality
- **Search History**: User search patterns

#### Social Features
- **User Reviews**: Public book reviews
- **Reading Groups**: Book clubs and discussions
- **Recommendations**: AI-powered book suggestions
- **Sharing**: Social media integration

#### Mobile App
- **React Native**: Cross-platform mobile app
- **Offline Support**: Offline reading capabilities
- **Push Notifications**: Reading reminders
- **Barcode Scanning**: ISBN scanning

#### Analytics Dashboard
- **Reading Statistics**: Personal reading insights
- **Genre Analysis**: Reading preferences
- **Reading Goals**: Goal setting and tracking
- **Progress Visualization**: Charts and graphs

### Technical Improvements

#### Architecture Enhancements
- **Microservices**: Service-oriented architecture
- **GraphQL**: Flexible data querying
- **Real-time Updates**: WebSocket integration
- **Progressive Web App**: PWA capabilities

#### Security Enhancements
- **OAuth Integration**: Social login options
- **Two-Factor Authentication**: Enhanced security
- **API Rate Limiting**: Request throttling
- **Data Encryption**: End-to-end encryption

#### Performance Optimizations
- **CDN Integration**: Global content delivery
- **Database Sharding**: Horizontal scaling
- **Caching Layer**: Redis integration
- **Load Balancing**: Traffic distribution

### User Experience Improvements

#### Accessibility
- **WCAG Compliance**: Full accessibility standards
- **Screen Reader Support**: Enhanced compatibility
- **Keyboard Navigation**: Complete keyboard support
- **High Contrast Mode**: Visual accessibility

#### Personalization
- **Custom Themes**: User-defined color schemes
- **Reading Preferences**: Personalized settings
- **Smart Recommendations**: ML-based suggestions
- **Custom Categories**: User-defined organization

#### Internationalization
- **Multi-language Support**: Multiple languages
- **RTL Support**: Right-to-left languages
- **Localization**: Cultural adaptations
- **Currency Support**: Multiple currencies

---

## Conclusion

This design documentation provides a comprehensive overview of the Book Manager application's architecture, user experience, and technical implementation. The application follows modern web development best practices with a focus on user experience, performance, and maintainability.

The modular architecture allows for easy extension and modification, while the comprehensive API design ensures scalability and flexibility. The user-centered design approach prioritizes simplicity and accessibility, making the application suitable for a wide range of users.

Future enhancements will build upon this solid foundation, adding advanced features while maintaining the core principles of simplicity, performance, and user experience. 