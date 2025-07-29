# Book Manager

A comprehensive personal book collection management application built with Next.js, TypeScript, and SQLite. Track your reading progress, organize books by genres, create reading lists, and discover new books through integrated recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd books
npm install
```

2. **Start the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

3. **Access the application:**
Open [http://localhost:3000](http://localhost:3000) in your browser

4. **Default login credentials:**
- Username: `admin`
- Password: `admin123`

The database will be automatically initialized with sample books and genres on first run.

## ✨ Key Features

### 📚 **Book Management**
- **Complete CRUD Operations**: Add, view, edit, and delete books
- **Rich Book Data**: Title, author, ISBN, page count, publication date, cover images, and descriptions
- **URL Scraping**: Add books by pasting URLs from popular book sites
- **Duplicate Detection**: Prevents adding the same book multiple times
- **Advanced Search**: Search by title, author, ISBN, genre, or description
- **Flexible Sorting**: Sort by title, author, publication date, page count, or language

### 👤 **User System**
- **Secure Authentication**: Registration and login with bcrypt password hashing
- **User Profiles**: Customizable nicknames and profile management
- **Personal Libraries**: Each user maintains their own book collection
- **Reading Privacy**: User data is completely isolated and secure

### 📖 **Reading Progress Tracking**
- **Reading Status**: Mark books as "Unread", "Currently Reading", or "Read"
- **Star Ratings**: Rate books from 1-5 stars with visual indicators
- **Personal Notes**: Add private comments and thoughts about books
- **Reading History**: Dedicated page to view all completed books
- **Progress Statistics**: Track your reading habits and preferences

### 🏷️ **Genre Organization**
- **Genre Management**: Create, edit, and organize book categories
- **Multi-Genre Support**: Books can belong to multiple genres
- **Genre Browsing**: Explore books by specific genres
- **Pre-loaded Genres**: Comes with 15+ popular genres including Classic, Science Fiction, Fantasy, Mystery, and more

### 📋 **Reading Lists**
- **Custom Lists**: Create personalized reading lists for different purposes
- **List Management**: Add/remove books, reorder items, and add notes
- **Public/Private Lists**: Share lists publicly or keep them private
- **Flexible Organization**: Perfect for "To Read", "Favorites", or themed collections

### 🔍 **Book Discovery**
- **External Recommendations**: Integration with TasteDive and Google Books APIs
- **Smart Suggestions**: Get book recommendations based on your reading history
- **Reading List Recommendations**: Discover books similar to those in your lists
- **Genre-based Discovery**: Find new books in your favorite genres

### 🎨 **Modern User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Tailwind CSS**: Clean, modern interface with consistent styling
- **Real-time Search**: Instant search results as you type
- **Pagination**: Efficient browsing of large book collections
- **Loading States**: Smooth user experience with proper loading indicators
- **Error Handling**: Graceful error messages and recovery

## 🏗️ Technical Architecture

### **Technology Stack**
- **Frontend**: Next.js 15.3.4 with React 19 and TypeScript
- **Backend**: Next.js API Routes with RESTful design
- **Database**: SQLite with better-sqlite3 for reliable local storage
- **Styling**: Tailwind CSS 4 for modern, responsive design
- **Authentication**: Custom secure authentication with bcrypt
- **Testing**: Vitest with comprehensive test coverage
- **Development**: ESLint, TypeScript, and Turbopack for fast development

### **Database Schema**
The application uses a well-designed relational database with the following core tables:

- **`users`**: User accounts with secure password hashing and profiles
- **`books`**: Comprehensive book information including ISBN, page count, cover images
- **`genres`**: Categorization system with descriptions
- **`user_book_associations`**: Reading progress, ratings, and personal comments
- **`reading_lists`**: Custom book lists with public/private settings
- **`book_genres`**: Many-to-many relationship between books and genres
- **`reading_list_books`**: Books within reading lists with positioning and notes

### **API Design**
RESTful API endpoints organized by resource:

- **Authentication**: `/api/auth/*` - Registration, login, logout, profile management
- **Books**: `/api/books/*` - CRUD operations, search, and book scraping
- **Genres**: `/api/genres/*` - Genre management and book categorization
- **User Books**: `/api/user-books/*` - Reading progress and personal associations
- **Reading Lists**: `/api/reading-lists/*` - List management and book organization
- **Recommendations**: `/api/recommendations/*` - External API integrations for book discovery

## 📱 User Interface

### **Navigation Structure**
```
📖 Books
├── All Books - Browse and search your entire collection
├── Add Book - Manual entry or URL scraping
└── Book Details - View, edit, rate, and manage individual books

🏷️ Genres
├── All Genres - Browse book categories
├── Create Genre - Add custom categories
└── Genre Details - View books in specific genres

📋 Reading Lists
├── My Lists - Personal reading list management
├── Create List - Build custom book collections
└── List Details - Manage books within lists

📚 Read Books - Completed reading history with ratings and notes

👤 Profile - Account settings and reading statistics
```

### **Key Pages & Features**

#### **Book Management**
- **Book List**: Paginated table with search, filtering, and sorting
- **Book Details**: Comprehensive view with cover image, metadata, and user actions
- **Add/Edit Forms**: Rich forms with validation and genre selection
- **URL Scraping**: Intelligent book data extraction from popular book sites

#### **Reading Progress**
- **Status Tracking**: Visual indicators for reading progress
- **Rating System**: Interactive 5-star rating with hover effects
- **Personal Notes**: Rich text comments and thoughts
- **Reading History**: Dedicated page for completed books with statistics

#### **Discovery & Recommendations**
- **External Integration**: TasteDive and Google Books API recommendations
- **Smart Suggestions**: Personalized recommendations based on reading history
- **Genre Exploration**: Discover new books in preferred categories

## 🧪 Testing & Development

### **Running Tests**
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

### **Development Commands**
```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

### **Project Structure**
```
books/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API endpoints
│   │   ├── books/             # Book management pages
│   │   ├── genres/            # Genre pages
│   │   ├── reading-lists/     # Reading list pages
│   │   └── ...
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility libraries and database
│   └── __tests__/             # Test files
├── docs/                      # Comprehensive documentation
├── scripts/                   # Database migration scripts
└── data/                      # SQLite database files
```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory:

- **[Design Document](docs/DESIGN.md)**: Complete technical architecture and design decisions
- **[Requirements](docs/REQUIREMENTS.md)**: Detailed functional and non-functional requirements
- **[Architecture Diagram](docs/architecture-diagram.md)**: System architecture overview
- **[URL Scraping](docs/URL_SCRAPING.md)**: Book data extraction capabilities

## 🚀 Deployment

### **Vercel (Recommended)**
The easiest deployment option:

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically build and deploy your application

### **Self-Hosting**
For self-hosting:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

**Note**: Ensure your hosting environment supports:
- Node.js 18+
- File system access for SQLite database
- Persistent storage for the `data/` directory

## 🔧 Configuration

### **Environment Variables**
Create a `.env.local` file for configuration:

```env
# Optional: Configure external API keys for recommendations
TASTEDIVE_API_KEY=your_tastedive_api_key
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

### **Database Location**
The SQLite database is stored in `data/books.db` and will be created automatically on first run.

---

## 🔌 API Reference

The application provides a comprehensive RESTful API. Here are some key endpoints:

### **Authentication**
```bash
# Register a new user
POST /api/auth/register
Content-Type: application/json
{"username": "newuser", "password": "password123", "nickname": "My Nickname"}

# Login
POST /api/auth/login
Content-Type: application/json
{"username": "admin", "password": "admin123"}

# Get user profile
GET /api/auth/profile

# Logout
POST /api/auth/logout
```

### **Books**
```bash
# Get paginated books with search and sorting
GET /api/books?page=1&limit=10&search=gatsby&sortBy=title&sortOrder=asc

# Get specific book with genres
GET /api/books/1

# Create a new book
POST /api/books
Content-Type: application/json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "isbn": "978-0743273565",
  "page_count": 180,
  "description": "A classic American novel",
  "genres": [1, 2]
}

# Scrape book data from URL
POST /api/books/scrape
Content-Type: application/json
{"url": "https://www.goodreads.com/book/show/4671.The_Great_Gatsby"}
```

### **Reading Progress**
```bash
# Get user's reading associations
GET /api/user-books?page=1&limit=10&sortBy=updated_at&sortOrder=desc

# Update reading status and rating
POST /api/user-books
Content-Type: application/json
{
  "book_id": 1,
  "read_status": "read",
  "rating": 5,
  "comments": "Absolutely loved this book!"
}

# Get read books only
GET /api/user-books/read?search=gatsby
```

### **Reading Lists**
```bash
# Get user's reading lists
GET /api/reading-lists

# Create a reading list
POST /api/reading-lists
Content-Type: application/json
{
  "name": "Summer Reading 2024",
  "description": "Books to read this summer",
  "is_public": false
}

# Add book to reading list
POST /api/reading-lists/1/books
Content-Type: application/json
{"book_id": 5, "notes": "Recommended by friend"}
```

### **Recommendations**
```bash
# Get recommendations based on reading history
GET /api/recommendations

# Get TasteDive recommendations
GET /api/recommendations/tastedive?query=science+fiction

# Get Google Books recommendations
GET /api/recommendations/google-books?query=fantasy+novels

# Get recommendations for a reading list
GET /api/recommendations/reading-list/1
```

For complete API documentation, see the [`src/app/api/`](src/app/api/) directory.

## 🤝 Contributing

We welcome contributions! Please see our development setup:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with proper tests
4. **Run the test suite**: `npm test`
5. **Submit a pull request**

### **Development Guidelines**
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Follow the existing code style (ESLint configuration)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Next.js Team** - For the excellent React framework
- **Vercel** - For the Geist font family and deployment platform
- **TasteDive & Google Books** - For recommendation APIs
- **Tailwind CSS** - For the utility-first CSS framework
- **SQLite & better-sqlite3** - For reliable local database storage

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**
