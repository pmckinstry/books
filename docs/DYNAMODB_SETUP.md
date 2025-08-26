# Complete DynamoDB Setup Guide

This comprehensive guide covers setting up DynamoDB for your books application in both local development and cloud production environments.

## 📋 Overview

DynamoDB can be configured in two ways:
- **Local Development**: Using DynamoDB Local for development and testing
- **Cloud Production**: Using AWS DynamoDB for scalable production deployments

Choose your setup based on your needs:
- 🏠 **Local**: Fast development, no AWS costs, offline capability
- ☁️ **Cloud**: Production-ready, scalable, managed service

---

## 🏠 Local Development Setup

Perfect for development, testing, and when working offline.

### Prerequisites
- Docker installed and running
- Node.js and npm
- No AWS account required

### Quick Start (Local)

#### 1. Start DynamoDB Local
```bash
# Use the provided script
./scripts/setup-dynamodb-local.sh
```

The script will:
- Check if Docker is running
- Start DynamoDB Local container on port 8000
- Verify the container is healthy

#### 2. Configure Environment
Create or update your `.env.local`:
```env
DATABASE_TYPE=dynamodb
DYNAMODB_LOCAL=true
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=fakeMyKeyId
AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey
```

#### 3. Create Tables
```bash
npx tsx scripts/create-dynamodb-tables.ts
```

#### 4. Migrate Data (Optional)
If you have existing SQLite data:
```bash
npx tsx scripts/migrate-to-dynamodb.ts
```

#### 5. Start Your Application
```bash
npm run dev
```

### Manual Local Setup (Alternative)

If you prefer not to use Docker:

1. **Download DynamoDB Local**:
```bash
# Download the JAR file
wget https://s3.us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.zip
unzip dynamodb_local_latest.zip
```

2. **Start DynamoDB Local**:
```bash
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000
```

3. **Continue from step 2** of Quick Start above

---

## ☁️ Cloud Production Setup

For scalable production deployments with managed AWS infrastructure.

### Prerequisites
- AWS account with billing configured
- AWS CLI installed
- Basic understanding of AWS IAM

### Quick Start (Cloud)

#### 1. AWS Account Setup
1. **Create AWS Account**: Go to [aws.amazon.com](https://aws.amazon.com)
2. **Setup Billing**: Configure payment method
3. **Note Your Region**: Choose your preferred AWS region (e.g., `us-east-1`)

#### 2. Create IAM User
```bash
# Via AWS Console:
# 1. Go to IAM > Users > Create user
# 2. Choose "Programmatic access"
# 3. Attach policy: AmazonDynamoDBFullAccess
# 4. Save the Access Key ID and Secret Access Key
```

#### 3. Configure AWS CLI
```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from: https://aws.amazon.com/cli/

# Configure credentials
aws configure
# Enter: Access Key ID, Secret Access Key, region (us-east-1), format (json)
```

#### 4. Create DynamoDB Tables in AWS
```bash
# Make script executable
chmod +x scripts/create-aws-dynamodb-tables.sh

# Create all tables
./scripts/create-aws-dynamodb-tables.sh
```

#### 5. Configure Environment
Update your `.env.local`:
```env
DATABASE_TYPE=dynamodb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DYNAMODB_LOCAL=false
```

#### 6. Migrate Data (Optional)
If migrating from local DynamoDB:
```bash
npx tsx scripts/migrate-local-to-aws.ts
```

If migrating from SQLite:
```bash
npx tsx scripts/migrate-to-dynamodb.ts
```

#### 7. Deploy Your Application
```bash
# Test locally first
npm run dev

# Then deploy to your cloud platform
npm run build
```

---

## 📊 Table Structure

All environments use the same table schemas:

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

---

## 🔧 Configuration Options

### Environment Variables

| Variable | Local | Cloud | Description |
|----------|-------|-------|-------------|
| `DATABASE_TYPE` | `dynamodb` | `dynamodb` | Database type |
| `DYNAMODB_LOCAL` | `true` | `false` | Use local DynamoDB |
| `DYNAMODB_ENDPOINT` | `http://localhost:8000` | (not set) | Local endpoint |
| `AWS_REGION` | `us-east-1` | `us-east-1` | AWS region |
| `AWS_ACCESS_KEY_ID` | `fakeMyKeyId` | `AKIA...` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | `fakeSecretAccessKey` | `real_secret` | AWS secret |
| `AWS_PROFILE` | (not used) | `production` | AWS profile (alternative) |

### AWS Credential Methods (Cloud Only)

1. **Access Keys** (development):
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

2. **AWS Profile**:
```env
AWS_PROFILE=your_profile_name
```

3. **IAM Roles** (production - recommended):
- No credentials in environment
- Uses EC2/ECS/Lambda execution role

---

## 💰 Cost Considerations (Cloud Only)

### Development/Testing
- **Free Tier**: 25GB storage, 200M requests/month
- **Typical Monthly Cost**: $0-10 for small projects

### Production Scaling
- **Provisioned Mode**: Fixed capacity, predictable costs
- **On-Demand Mode**: Pay per request, variable costs

### Sample Costs
```bash
# Provisioned (5 RCU/WCU per table)
# ~$0.25/month per table = ~$1.50/month total

# On-Demand (10K requests/day)
# ~$0.25 per million requests = ~$0.08/month
```

### Cost Optimization
```bash
# Switch to on-demand for variable workloads
aws dynamodb update-table \
  --table-name books-books \
  --billing-mode PAY_PER_REQUEST
```

---

## 🔄 Switching Between Environments

### Local to Cloud
```bash
# 1. Update environment
cp .env.local .env.local.backup
cat > .env.local << EOF
DATABASE_TYPE=dynamodb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_key
AWS_SECRET_ACCESS_KEY=your_actual_secret
DYNAMODB_LOCAL=false
EOF

# 2. Create cloud tables
./scripts/create-aws-dynamodb-tables.sh

# 3. Migrate data
npx tsx scripts/migrate-local-to-aws.ts

# 4. Test
npm run dev
```

### Cloud to Local
```bash
# 1. Start local DynamoDB
./scripts/setup-dynamodb-local.sh

# 2. Update environment
cat > .env.local << EOF
DATABASE_TYPE=dynamodb
DYNAMODB_LOCAL=true
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=fakeMyKeyId
AWS_SECRET_ACCESS_KEY=fakeSecretAccessKey
EOF

# 3. Create local tables
npx tsx scripts/create-dynamodb-tables.ts

# 4. Test
npm run dev
```

---

## 🧪 Testing and Verification

### Test Connection
```bash
# Test DynamoDB connection
npx tsx scripts/test-dynamodb-connection.ts
```

### Verify Tables (Local)
```bash
# List tables
aws dynamodb list-tables --endpoint-url http://localhost:8000

# Check table contents
aws dynamodb scan --table-name books-books --endpoint-url http://localhost:8000
```

### Verify Tables (Cloud)
```bash
# List tables
aws dynamodb list-tables --region us-east-1

# Check table status
aws dynamodb describe-table --table-name books-books --region us-east-1

# Count items
aws dynamodb scan --table-name books-books --select COUNT --region us-east-1
```

### Test Application
```bash
# Start application
npm run dev

# Test API endpoints
curl "http://localhost:3000/api/books?page=1&limit=5"
curl "http://localhost:3000/api/genres"
```

---

## 🚨 Troubleshooting

### Local Development Issues

#### Docker Not Running
```bash
# Check Docker status
docker ps

# Start Docker Desktop
# Then retry: ./scripts/setup-dynamodb-local.sh
```

#### Port 8000 in Use
```bash
# Check what's using the port
lsof -i :8000

# Stop conflicting process or change port in setup script
```

#### Container Issues
```bash
# Stop and remove DynamoDB container
docker stop dynamodb-local
docker rm dynamodb-local

# Restart
./scripts/setup-dynamodb-local.sh
```

### Cloud Production Issues

#### Access Denied
```bash
# Verify AWS credentials
aws sts get-caller-identity

# Check IAM permissions
aws iam get-user
aws iam list-attached-user-policies --user-name your-username
```

#### Table Not Found
```bash
# List tables in your region
aws dynamodb list-tables --region us-east-1

# Verify table name format (should be "books-users", "books-books", etc.)
```

#### Region Mismatch
```bash
# Check your configured region
aws configure get region

# Update if needed
aws configure set region us-east-1
```

### Migration Issues

#### Data Migration Fails
```bash
# Check source database is accessible
npx tsx scripts/test-dynamodb-connection.ts

# Verify target tables exist
aws dynamodb list-tables

# Check migration logs for specific errors
```

#### Incomplete Migration
```bash
# Compare record counts
# Source (SQLite)
sqlite3 data/books.db "SELECT COUNT(*) FROM books;"

# Target (DynamoDB)
aws dynamodb scan --table-name books-books --select COUNT
```

---

## 🔒 Security Best Practices

### Local Development
- Use fake credentials for local development
- Never commit real AWS credentials
- Keep local data separate from production

### Cloud Production

#### IAM Policy (Minimal Permissions)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/books-*",
        "arn:aws:dynamodb:*:*:table/books-*/index/*"
      ]
    }
  ]
}
```

#### Environment Security
```bash
# Never commit credentials
echo ".env.local" >> .gitignore

# Use AWS Secrets Manager in production
# Rotate access keys regularly
# Consider using IAM roles instead of access keys
```

#### Network Security
```bash
# Use VPC endpoints for DynamoDB in production
# Enable encryption at rest
# Enable encryption in transit
```

---

## 📈 Monitoring and Optimization

### Local Development
```bash
# Monitor local DynamoDB logs
docker logs dynamodb-local

# Check resource usage
docker stats dynamodb-local
```

### Cloud Production

#### CloudWatch Metrics
- **ReadThrottledEvents**: Monitor for capacity issues
- **WriteThrottledEvents**: Monitor for capacity issues
- **ConsumedReadCapacityUnits**: Track read usage
- **ConsumedWriteCapacityUnits**: Track write usage

#### Cost Monitoring
```bash
# Set up billing alerts in AWS Console
# Monitor costs in AWS Cost Explorer
# Use AWS Budgets for spending limits
```

#### Performance Optimization
```bash
# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --resource-id table/books-books \
  --min-capacity 5 \
  --max-capacity 100

# Enable point-in-time recovery
aws dynamodb update-continuous-backups \
  --table-name books-books \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

---

## 🔄 Data Migration Scripts

The application includes several migration scripts:

### Available Scripts
```bash
# Create tables (local or cloud based on environment)
npx tsx scripts/create-dynamodb-tables.ts

# Migrate from SQLite to DynamoDB
npx tsx scripts/migrate-to-dynamodb.ts

# Migrate from local DynamoDB to AWS DynamoDB
npx tsx scripts/migrate-local-to-aws.ts

# Test connection
npx tsx scripts/test-dynamodb-connection.ts

# Simple functionality test
npx tsx scripts/simple-dynamodb-test.ts
```

### Migration Process
1. **Preserve all data**: No data loss during migration
2. **Generate new IDs**: UUIDs for DynamoDB compatibility
3. **Maintain relationships**: Foreign keys become references
4. **Handle passwords**: Default password for migrated users

---

## 📚 Additional Resources

### Documentation
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [DynamoDB Local Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)

### Tools
- [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- [NoSQL Workbench for DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/workbench.html)
- [AWS CLI DynamoDB Commands](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/)

### Community
- [DynamoDB Forum](https://forums.aws.amazon.com/forum.jspa?forumID=131)
- [AWS DynamoDB GitHub](https://github.com/aws/aws-sdk-js-v3)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/amazon-dynamodb)

---

## 🎯 Next Steps

### After Setup
1. **Test thoroughly** in your development environment
2. **Monitor performance** and costs in production
3. **Set up backups** and disaster recovery
4. **Implement caching** for frequently accessed data
5. **Consider DynamoDB Streams** for real-time features

### Advanced Features
- **Global Tables**: Multi-region replication
- **DynamoDB Accelerator (DAX)**: Microsecond latency caching
- **Time to Live (TTL)**: Automatic item expiration
- **Streams**: Real-time data change capture
- **Transactions**: ACID transactions across multiple items

### Production Checklist
- ✅ IAM roles configured with minimal permissions
- ✅ Encryption enabled (at rest and in transit)
- ✅ Backup strategy implemented
- ✅ Monitoring and alerting configured
- ✅ Cost optimization measures in place
- ✅ Security audit completed
- ✅ Disaster recovery plan documented

---

Need help? Check the troubleshooting section above or refer to the AWS DynamoDB documentation for detailed technical information.