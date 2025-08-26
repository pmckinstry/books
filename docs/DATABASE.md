# Database Configuration Guide

The Book Manager application supports three different database backends, each optimized for different use cases. This guide provides comprehensive setup instructions and considerations for each option.

## Overview

The application uses a database abstraction layer that provides a consistent API regardless of the underlying database. This allows you to:

- Switch between databases with minimal configuration changes
- Maintain consistent data models across all backends
- Leverage the strengths of each database type for different deployment scenarios

## Database Selection

Configure your preferred database by setting the `DATABASE_TYPE` environment variable:

```env
DATABASE_TYPE=sqlite    # Default - best for development and small deployments
DATABASE_TYPE=dynamodb  # AWS cloud solution for scalable production
DATABASE_TYPE=firebase  # Google cloud solution with real-time features
```

## SQLite Configuration

### Overview
SQLite is the default database option, perfect for local development and single-user deployments.

#### Advantages ✅
- **Zero Configuration**: Works out of the box with no setup required
- **Fast Performance**: Excellent for small to medium datasets
- **Self-contained**: Single file database with no external dependencies
- **ACID Compliance**: Full transaction support
- **Mature & Stable**: Well-tested and reliable

#### Limitations ❌
- **Single Writer**: Limited concurrent write operations
- **Scaling**: Not suitable for high-traffic applications
- **Network Access**: File-based, no network protocol
- **Memory Usage**: Entire database loaded into memory for complex queries

### Setup Instructions

#### Basic Setup
No configuration required! The application will automatically:
1. Create a `data/` directory in your project root
2. Initialize `data/books.db` with the required schema
3. Populate sample data on first run

#### Custom Database Path
```env
# .env.local
DATABASE_TYPE=sqlite
SQLITE_DATABASE_PATH=/custom/path/to/database.db
```

#### Production Considerations
- **Backups**: Regularly backup the `data/books.db` file
- **Permissions**: Ensure the application has read/write access to the data directory
- **Storage**: Monitor disk space usage
- **Performance**: Consider moving to a cloud database for >1000 concurrent users

### File Structure
```
project/
├── data/
│   └── books.db          # SQLite database file
├── src/lib/
│   └── database.ts       # SQLite implementation
└── .env.local           # Optional configuration
```

## DynamoDB Configuration

### Overview
DynamoDB is Amazon's fully managed NoSQL database service, ideal for scalable cloud deployments.

#### Advantages ✅
- **Highly Scalable**: Handles massive traffic loads automatically
- **Managed Service**: No server maintenance required
- **Global Distribution**: Multi-region replication support
- **Performance**: Consistent single-digit millisecond latency
- **Security**: Built-in encryption and IAM integration

#### Limitations ❌
- **Cost Complexity**: Pay-per-request pricing can be unpredictable
- **AWS Dependency**: Requires AWS account and services
- **Query Limitations**: No complex joins or full-text search
- **Learning Curve**: Requires NoSQL design patterns

### Setup Instructions

#### 1. AWS Account Setup
1. Create an AWS account at [aws.amazon.com](https://aws.amazon.com)
2. Set up billing and payment methods
3. Note your AWS region (e.g., `us-east-1`)

#### 2. IAM User Creation
Create an IAM user with DynamoDB permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable",
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:BatchGetItem",
                "dynamodb:BatchWriteItem"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/books-*"
        }
    ]
}
```

#### 3. Environment Configuration
```env
# .env.local
DATABASE_TYPE=dynamodb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Optional: For local development with DynamoDB Local
DYNAMODB_LOCAL=true
DYNAMODB_ENDPOINT=http://localhost:8000
```

#### 4. Table Creation
Run the table creation script:
```bash
npm run ts-node scripts/create-dynamodb-tables.ts
```

This creates the following tables:
- `books-users`
- `books-books`
- `books-genres`
- `books-user-book-associations`
- `books-reading-lists`
- `books-reading-list-books`

#### 5. Data Migration (Optional)
Migrate existing SQLite data to DynamoDB:
```bash
npm run ts-node scripts/migrate-to-dynamodb.ts
```

### Local Development with DynamoDB Local

For development without AWS costs:

1. **Install DynamoDB Local**:
```bash
# Using Docker
docker run -p 8000:8000 amazon/dynamodb-local

# Or download JAR file from AWS
```

2. **Configure Environment**:
```env
DATABASE_TYPE=dynamodb
DYNAMODB_LOCAL=true
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=dummy
AWS_SECRET_ACCESS_KEY=dummy
```

### Production Deployment

#### Cost Optimization
- **On-Demand Pricing**: Pay only for what you use (recommended for variable traffic)
- **Provisioned Capacity**: Fixed pricing for predictable traffic patterns
- **Reserved Capacity**: Up to 76% savings for long-term usage

#### Monitoring
- Set up CloudWatch alarms for throttling
- Monitor read/write capacity utilization
- Track costs with AWS Billing alerts

#### Backup Strategy
- Enable Point-in-Time Recovery (PITR)
- Set up automated backups
- Test restore procedures regularly

## Firebase Configuration

### Overview
Firebase Firestore is Google's cloud-native NoSQL document database with real-time synchronization capabilities.

#### Advantages ✅
- **Real-time Updates**: Live data synchronization across clients
- **Offline Support**: Built-in offline capabilities
- **Google Integration**: Works seamlessly with Google services
- **Security Rules**: Fine-grained access control
- **Global CDN**: Fast worldwide performance

#### Limitations ❌
- **Query Limitations**: Limited complex query support
- **Vendor Lock-in**: Tight coupling to Google ecosystem
- **Pricing**: Can become expensive with high read/write volumes
- **Learning Curve**: Requires understanding of NoSQL concepts

### Setup Instructions

#### 1. Firebase Project Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Choose production mode and select a region

#### 2. Authentication Setup
1. Go to Project Settings → Service Accounts
2. Generate a new private key
3. Download the JSON file
4. Store securely (never commit to version control)

#### 3. Environment Configuration
```env
# .env.local
DATABASE_TYPE=firebase

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

# Or use Firebase Config Object
FIREBASE_CONFIG='{
  "apiKey": "your-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "your-app-id"
}'
```

#### 4. Security Rules
Configure Firestore security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Books are readable by authenticated users
    match /books/{bookId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null; // Add more specific rules as needed
    }
    
    // User-specific collections
    match /user_book_associations/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
    
    match /reading_lists/{listId} {
      allow read, write: if request.auth != null && 
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

#### 5. Data Migration (Optional)
Migrate existing data to Firebase:
```bash
npm run ts-node scripts/migrate-to-firebase.ts
```

### Firebase Emulator (Development)

For local development:

1. **Install Firebase CLI**:
```bash
npm install -g firebase-tools
```

2. **Initialize Emulators**:
```bash
firebase init emulators
```

3. **Start Emulators**:
```bash
firebase emulators:start
```

4. **Configure Environment**:
```env
DATABASE_TYPE=firebase
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
```

## Data Schema & Models

All database backends implement the same logical data model:

### Core Entities

#### Users
```typescript
interface User {
  id: string;              // Auto-generated ID
  username: string;        // Unique username
  nickname?: string;       // Display name
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

#### Books
```typescript
interface Book {
  id: string;                    // Auto-generated ID
  title: string;                 // Book title
  author: string;                // Author name
  description?: string;          // Book description
  isbn?: string;                 // ISBN identifier
  page_count?: number;           // Number of pages
  language?: string;             // Language (default: English)
  publisher?: string;            // Publisher name
  cover_image_url?: string;      // Cover image URL
  publication_date?: string;     // Publication date
  user_id?: string;             // User who added the book
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}
```

#### User-Book Associations
```typescript
interface UserBookAssociation {
  id: string;                           // Auto-generated ID
  user_id: string;                      // Reference to user
  book_id: string;                      // Reference to book
  read_status: 'unread' | 'reading' | 'read';
  rating?: number;                      // 1-5 star rating
  comments?: string;                    // Personal notes
  created_at: string;                   // ISO timestamp
  updated_at: string;                   // ISO timestamp
}
```

#### Genres
```typescript
interface Genre {
  id: string;              // Auto-generated ID
  name: string;            // Genre name (unique)
  description?: string;    // Genre description
}
```

#### Reading Lists
```typescript
interface ReadingList {
  id: string;              // Auto-generated ID
  name: string;            // List name
  description?: string;    // List description
  is_public: boolean;      // Public visibility
  user_id: string;         // Owner reference
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

### Relationships

#### Many-to-Many: Books ↔ Genres
- **SQLite**: `book_genres` junction table
- **DynamoDB**: Embedded arrays or separate table
- **Firebase**: Subcollections or embedded arrays

#### One-to-Many: User → Reading Lists
- **SQLite**: Foreign key constraint
- **DynamoDB**: GSI on user_id
- **Firebase**: Subcollection under user

#### Many-to-Many: Reading Lists ↔ Books
- **SQLite**: `reading_list_books` junction table
- **DynamoDB**: Separate table with composite keys
- **Firebase**: Subcollection with book references

## Performance Considerations

### SQLite Optimization
```sql
-- Index commonly queried fields
CREATE INDEX idx_books_title ON books(title);
CREATE INDEX idx_books_author ON books(author);
CREATE INDEX idx_user_books_user_id ON user_book_associations(user_id);
CREATE INDEX idx_user_books_status ON user_book_associations(read_status);
```

### DynamoDB Optimization
- **Partition Key Design**: Distribute data evenly across partitions
- **Sort Key Strategy**: Enable range queries and sorting
- **GSI Planning**: Design Global Secondary Indexes for access patterns
- **Batch Operations**: Use batch reads/writes for efficiency

### Firebase Optimization
- **Composite Indexes**: Create indexes for multi-field queries
- **Pagination**: Use `startAfter()` for efficient pagination
- **Denormalization**: Duplicate data to reduce reads
- **Security Rules**: Optimize rules for performance

## Migration Between Databases

### SQLite → DynamoDB
```bash
# Full migration with data
npm run ts-node scripts/migrate-to-dynamodb.ts

# Structure only (no data)
npm run ts-node scripts/create-dynamodb-tables.ts
```

### SQLite → Firebase
```bash
# Full migration with data
npm run ts-node scripts/migrate-to-firebase.ts

# Test connection only
npm run ts-node scripts/test-firebase-connection.ts
```

### DynamoDB → SQLite (Backup)
```bash
# Export DynamoDB data to SQLite
npm run ts-node scripts/migrate-to-sqlite.ts
```

## Backup Strategies

### SQLite Backups
```bash
# Simple file copy
cp data/books.db data/books-backup-$(date +%Y%m%d).db

# SQLite dump
sqlite3 data/books.db .dump > backup.sql
```

### DynamoDB Backups
```bash
# AWS CLI backup
aws dynamodb create-backup --table-name books-users --backup-name users-backup

# Point-in-time recovery (enable in AWS Console)
```

### Firebase Backups
```bash
# Firestore export
gcloud firestore export gs://your-bucket/backup-folder

# Using Firebase CLI
firebase firestore:delete --all-collections --force
```

## Troubleshooting

### Common SQLite Issues
- **File Permissions**: Ensure write access to data directory
- **Disk Space**: Monitor available storage
- **Corruption**: Use `PRAGMA integrity_check;`

### Common DynamoDB Issues
- **Throttling**: Increase provisioned capacity or use on-demand
- **Access Denied**: Check IAM permissions
- **Item Size**: Max 400KB per item

### Common Firebase Issues
- **Permission Denied**: Check security rules
- **Quota Exceeded**: Monitor usage in console
- **Offline Issues**: Configure offline persistence

## Cost Comparison

### Development Costs
- **SQLite**: Free (local file storage)
- **DynamoDB**: Free tier: 25GB storage, 200M requests/month
- **Firebase**: Free tier: 1GB storage, 50K reads, 20K writes/day

### Production Costs (Estimated)
#### Low Traffic (10K requests/day)
- **SQLite**: $5-20/month (hosting + storage)
- **DynamoDB**: $10-25/month
- **Firebase**: $15-30/month

#### High Traffic (1M requests/day)
- **SQLite**: Not recommended (scaling issues)
- **DynamoDB**: $100-500/month (depending on data size)
- **Firebase**: $200-800/month

## Monitoring & Observability

### SQLite Monitoring
```sql
-- Query performance analysis
EXPLAIN QUERY PLAN SELECT * FROM books WHERE title LIKE '%gatsby%';

-- Database size monitoring
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();
```

### DynamoDB Monitoring
- CloudWatch metrics for read/write capacity
- X-Ray tracing for performance analysis
- AWS Cost Explorer for spend tracking

### Firebase Monitoring
- Firebase Console usage dashboard
- Cloud Monitoring for detailed metrics
- Performance Monitoring for client-side tracking

## Security Best Practices

### All Databases
- Use environment variables for credentials
- Implement proper authentication
- Regular security audits
- Encrypt data in transit and at rest

### Database-Specific Security
- **SQLite**: File system permissions, WAL mode
- **DynamoDB**: IAM roles, VPC endpoints, encryption
- **Firebase**: Security rules, service account keys

## Support & Resources

### Documentation
- [SQLite Documentation](https://sqlite.org/docs.html)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [Firebase Documentation](https://firebase.google.com/docs/firestore)

### Community Support
- SQLite: [SQLite Forum](https://sqlite.org/forum/forumindex)
- DynamoDB: [AWS Forums](https://forums.aws.amazon.com/forum.jspa?forumID=131)
- Firebase: [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

### Professional Support
- DynamoDB: AWS Premium Support
- Firebase: Google Cloud Support
- SQLite: Professional support through vendors

---

For specific setup instructions for your chosen database, see the respective setup guide files:
- [DYNAMODB_SETUP.md](DYNAMODB_SETUP.md) - Complete guide for both local and cloud DynamoDB setup
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase/Firestore configuration guide