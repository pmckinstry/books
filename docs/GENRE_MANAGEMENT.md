# Genre Management Guide

This document explains how to manage genres in the books application database.

## 📚 Current Genres

The application currently supports **16 genres**:

### Core Genres
- **Classic** - Timeless literary works that have stood the test of time
- **Dystopian** - Fiction set in oppressive, totalitarian societies
- **Romance** - Stories focused on romantic relationships
- **Fantasy** - Fiction featuring magical elements and imaginary worlds
- **Adventure** - Stories involving exciting journeys and quests
- **Horror** - Fiction designed to frighten and scare readers
- **Science Fiction** - Fiction exploring futuristic concepts and technology
- **Satire** - Works using humor and irony to criticize society
- **Historical** - Fiction set in the past with real historical events
- **Philosophy** - Works exploring fundamental questions about existence
- **Children** - Literature written specifically for young readers
- **Poetry** - Literary works using rhythm and figurative language
- **Drama** - Works written for performance with dialogue
- **Mystery** - Stories involving puzzles and crimes
- **Nonfiction** - Factual works based on real events and information

### New Genres (Added 2024)
- **Fiction** - Imaginative works of prose not based on real events
- **Tragedy** - Dramatic works depicting the downfall of noble characters

## 🚀 Adding New Genres

### Option 1: Add to Existing Database
Use the `add-new-genres.ts` script to add only the new genres:

```bash
# Install dependencies if needed
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb uuid

# Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="your-region"

# Run the script
npx ts-node add-new-genres.ts
```

### Option 2: Re-initialize Entire Database
Use the `reinitialize-database.ts` script to clear and recreate all genres:

```bash
# Run the re-initialization script
npx ts-node reinitialize-database.ts
```

⚠️ **Warning**: This will delete all existing genres and recreate them with new UUIDs.

## 📝 Adding Genres to Source Code

When adding new genres, update these files:

### 1. SQLite Database (`src/lib/database.ts`)
Add to the `genres` array in the `initializeDatabase` function:

```typescript
const genres = [
  // ... existing genres ...
  { name: 'New Genre', description: 'Description of the new genre.' }
];
```

### 2. DynamoDB Database (`src/lib/dynamodb-database.ts`)
The genres are dynamically created when the database is initialized, so no code changes are needed.

### 3. Re-initialization Script (`reinitialize-database.ts`)
Add to the `allGenres` array:

```typescript
const allGenres = [
  // ... existing genres ...
  { name: 'New Genre', description: 'Description of the new genre.' }
];
```

## 🔄 Database Re-initialization Process

The re-initialization script performs these steps:

1. **Clear existing genres** - Deletes all current genres from the DynamoDB table
2. **Generate new UUIDs** - Creates fresh UUIDs for each genre
3. **Add all genres** - Inserts the complete genre list with new IDs
4. **Save mapping** - Creates a `genre-mapping.json` file with the new UUIDs

## 📊 Genre ID Mapping

After re-initialization, a `genre-mapping.json` file is created with the new UUIDs:

```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "totalGenres": 16,
  "genres": {
    "Classic": "uuid-1",
    "Dystopian": "uuid-2",
    "Fiction": "uuid-15",
    "Tragedy": "uuid-16"
  }
}
```

## ⚠️ Important Notes

1. **Book Genre References**: After re-initialization, existing books will have invalid genre IDs. You'll need to update book genre references or re-add books.

2. **Cache Invalidation**: The application automatically invalidates genre caches when genres are modified.

3. **Backup**: Always backup your data before running re-initialization scripts.

4. **Environment Variables**: Ensure your AWS credentials are properly configured before running scripts.

## 🧪 Testing New Genres

After adding new genres:

1. **Check the genres list** - Visit `/genres` to see all available genres
2. **Create a book** - Try adding a book with the new genres
3. **Edit existing books** - Test adding new genres to existing books
4. **Filter by genre** - Verify genre-based filtering works correctly

## 🆘 Troubleshooting

### Common Issues

1. **"Genre not found" errors** - Run the re-initialization script
2. **Missing genres in dropdown** - Check if the genres were added successfully
3. **Cache issues** - Restart the application to clear caches

### Debug Commands

```bash
# Check current genres in DynamoDB
aws dynamodb scan --table-name genres --region your-region

# View application logs for genre-related errors
npm run dev
```

## 📞 Support

If you encounter issues with genre management:

1. Check the application logs for error messages
2. Verify your AWS credentials and permissions
3. Ensure the DynamoDB tables exist and are accessible
4. Check the `genre-mapping.json` file for correct UUIDs
