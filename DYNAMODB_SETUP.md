# DynamoDB Setup Guide

This guide will help you set up DynamoDB for your books application, either locally for development or in AWS for production.

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Docker installed and running
- Node.js and npm

### 2. Start DynamoDB Local
```bash
./scripts/setup-dynamodb-local.sh
```

This script will:
- Check if Docker is running
- Start a DynamoDB Local container on port 8000
- Verify the container is running

### 3. Create Tables
```bash
npx tsx scripts/create-dynamodb-tables.ts
```

This will create all necessary tables with proper schemas and indexes.

### 4. Migrate Data from SQLite
```bash
npx tsx scripts/migrate-to-dynamodb.ts
```

This will transfer all your existing data from SQLite to DynamoDB.

## 🌐 Production Setup (AWS)

### 1. AWS Account Setup
- Create an AWS account
- Create an IAM user with DynamoDB permissions
- Generate access keys

### 2. Environment Variables
Update your `.env.local` file:
```bash
DATABASE_TYPE=dynamodb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
DYNAMODB_LOCAL=false
```

### 3. Create Tables in AWS
Use the AWS CLI or AWS Console to create tables using the schemas in `src/lib/dynamodb.ts`.

## 📊 Table Structure

### Users Table
- **Primary Key**: `id` (String)
- **GSI**: `username-index` on `username` field
- **Attributes**: username, nickname, created_at, updated_at

### Books Table
- **Primary Key**: `id` (String)
- **GSI**: `title-author-index` on `title` and `author` fields
- **Attributes**: title, author, description, isbn, page_count, language, publisher, cover_image_url, publication_date, user_id, created_at, updated_at

### Genres Table
- **Primary Key**: `id` (String)
- **GSI**: `name-index` on `name` field
- **Attributes**: name, description, created_at, updated_at

### User Book Associations Table
- **Primary Key**: `user_id` (String) + `book_id` (String)
- **Attributes**: read_status, rating, comments, created_at, updated_at

### Reading Lists Table
- **Primary Key**: `id` (String)
- **GSI**: `user_id-index` on `user_id` field
- **Attributes**: name, description, is_public, user_id, created_at, updated_at

### Reading List Books Table
- **Primary Key**: `reading_list_id` (String) + `book_id` (String)
- **Attributes**: position, notes, added_at

## 🔧 Configuration

### Environment Variables
- `DATABASE_TYPE`: Set to `dynamodb` (default)
- `AWS_REGION`: AWS region for DynamoDB (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS access key (required for production)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (required for production)
- `DYNAMODB_LOCAL`: Set to `true` for local development

### Database Factory
The application automatically uses the correct database based on `DATABASE_TYPE`:
- `dynamodb` → DynamoDB operations
- `firebase` → Firebase operations  
- `sqlite` → SQLite operations

## 📝 Migration Notes

### Data Preservation
- All data is preserved during migration
- New UUIDs are generated for DynamoDB documents
- Relationships between entities are maintained

### Password Handling
- User passwords cannot be migrated from SQLite
- All users get a default password: `changeme123`
- Users should change passwords after first login

### Genre Relationships
- Book-genre relationships are preserved
- Genre IDs are mapped from SQLite to DynamoDB

## 🧪 Testing

### Test Configuration
```bash
npx tsx scripts/test-dynamodb-connection.ts
```

### Test Operations
```bash
# Test table creation
npx tsx scripts/create-dynamodb-tables.ts

# Test data migration
npx tsx scripts/migrate-to-dynamodb.ts
```

## 🚨 Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Start Docker Desktop or Docker daemon
# Then run the setup script again
./scripts/setup-dynamodb-local.sh
```

#### Port 8000 Already in Use
```bash
# Check what's using port 8000
lsof -i :8000

# Stop the conflicting process or change the port in the setup script
```

#### Migration Errors
- Ensure DynamoDB Local is running
- Check that tables are created successfully
- Verify SQLite database exists and is accessible

#### AWS Connection Issues
- Verify AWS credentials are correct
- Check IAM permissions for DynamoDB
- Ensure the specified region exists

## 🔄 Switching Between Databases

### To DynamoDB (Local)
```bash
DATABASE_TYPE=dynamodb DYNAMODB_LOCAL=true npm run dev
```

### To DynamoDB (AWS)
```bash
DATABASE_TYPE=dynamodb DYNAMODB_LOCAL=false npm run dev
```

### To SQLite
```bash
DATABASE_TYPE=sqlite npm run dev
```

### To Firebase
```bash
DATABASE_TYPE=firebase npm run dev
```

## 📚 Additional Resources

- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)

## 🎯 Next Steps

After successful setup:
1. Test your application with DynamoDB
2. Update any hardcoded database references
3. Consider implementing additional DynamoDB features (streams, TTL, etc.)
4. Set up monitoring and alerts for production
