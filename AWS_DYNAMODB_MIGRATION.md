# AWS DynamoDB Cloud Migration Guide

This guide will help you migrate your books application from local DynamoDB to AWS DynamoDB in the cloud.

## 🚀 Quick Start Migration

### 1. **Prerequisites**
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Node.js and npm
- Your local DynamoDB data ready for migration

### 2. **One-Command Migration**
```bash
# Run the automated migration script
./scripts/update-env-for-aws.sh
```

Then edit `.env.local` with your AWS credentials and run:
```bash
./scripts/create-aws-dynamodb-tables.sh
npx tsx scripts/migrate-local-to-aws.ts
```

## 📋 Detailed Step-by-Step Migration

### **Step 1: AWS Account Setup**

1. **Create AWS Account** (if you don't have one):
   - Go to [aws.amazon.com](https://aws.amazon.com)
   - Click "Create an AWS Account"
   - Follow the signup process

2. **Create IAM User**:
   ```bash
   # Go to AWS IAM Console
   # Create new user with programmatic access
   # Attach AmazonDynamoDBFullAccess policy
   ```

3. **Generate Access Keys**:
   - Create access key ID and secret access key
   - Save these securely

### **Step 2: AWS CLI Configuration**

```bash
# Install AWS CLI
brew install awscli  # macOS
# or download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter your Access Key ID, Secret Access Key, region (e.g., us-east-1), and output format (json)
```

### **Step 3: Create DynamoDB Tables in AWS**

```bash
# Make script executable
chmod +x scripts/create-aws-dynamodb-tables.sh

# Run table creation
./scripts/create-aws-dynamodb-tables.sh
```

This will create all necessary tables with proper schemas and indexes.

### **Step 4: Update Environment Variables**

```bash
# Run the environment update script
./scripts/update-env-for-aws.sh

# Edit .env.local with your actual AWS credentials
nano .env.local
```

Your `.env.local` should look like:
```bash
DATABASE_TYPE=dynamodb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DYNAMODB_LOCAL=false
```

### **Step 5: Migrate Data from Local to AWS**

```bash
# Run the migration script
npx tsx scripts/migrate-local-to-aws.ts
```

This will transfer all your data from local DynamoDB to AWS DynamoDB.

### **Step 6: Test Your Application**

```bash
# Start your application with AWS DynamoDB
npm run dev
```

## 🔧 Configuration Options

### **Environment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_TYPE` | Database to use | `dynamodb` |
| `AWS_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalr...` |
| `AWS_PROFILE` | AWS profile name | `production` |
| `DYNAMODB_LOCAL` | Use local DynamoDB | `false` |

### **AWS Credential Methods**

1. **Access Keys** (recommended for development):
   ```bash
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   ```

2. **AWS Profile**:
   ```bash
   AWS_PROFILE=your_profile_name
   ```

3. **IAM Roles** (recommended for production):
   - No credentials needed
   - Automatically uses instance/container role

## 📊 Table Structure

### **Users Table**
- **Primary Key**: `id` (String)
- **GSI**: `username-index` on `username` field
- **Provisioned Throughput**: 5 read/write units

### **Books Table**
- **Primary Key**: `id` (String)
- **GSI**: `title-author-index` on `title` and `author` fields
- **Provisioned Throughput**: 5 read/write units

### **Genres Table**
- **Primary Key**: `id` (String)
- **GSI**: `name-index` on `name` field
- **Provisioned Throughput**: 5 read/write units

### **User Book Associations Table**
- **Primary Key**: `user_id` (String) + `book_id` (String)
- **Provisioned Throughput**: 5 read/write units

### **Reading Lists Table**
- **Primary Key**: `id` (String)
- **GSI**: `user_id-index` on `user_id` field
- **Provisioned Throughput**: 5 read/write units

### **Reading List Books Table**
- **Primary Key**: `reading_list_id` (String) + `book_id` (String)
- **Provisioned Throughput**: 5 read/write units

## 💰 Cost Optimization

### **Provisioned Throughput**
- **Current**: 5 read/write units per table
- **Cost**: ~$0.25 per month per table
- **Total**: ~$1.50 per month for all tables

### **On-Demand Option**
For unpredictable workloads, consider switching to on-demand:
```bash
aws dynamodb update-table \
  --table-name books \
  --billing-mode PAY_PER_REQUEST
```

### **Auto Scaling**
Set up auto-scaling for production:
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --scalable-dimension dynamodb:table:ReadCapacityUnits \
  --resource-id table/books \
  --min-capacity 5 \
  --max-capacity 100
```

## 🔒 Security Best Practices

### **IAM Policies**
Create minimal IAM policy for your application:
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
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:123456789012:table/users",
        "arn:aws:dynamodb:us-east-1:123456789012:table/books",
        "arn:aws:dynamodb:us-east-1:123456789012:table/genres",
        "arn:aws:dynamodb:us-east-1:123456789012:table/user_book_associations",
        "arn:aws:dynamodb:us-east-1:123456789012:table/reading_lists",
        "arn:aws:dynamodb:us-east-1:123456789012:table/reading_list_books"
      ]
    }
  ]
}
```

### **Environment Security**
- Never commit `.env.local` to version control
- Use AWS Secrets Manager for production
- Rotate access keys regularly
- Consider using IAM roles instead of access keys

## 🧪 Testing and Verification

### **Verify Tables Created**
```bash
aws dynamodb list-tables --region us-east-1
```

### **Verify Data Migration**
```bash
# Check item count in each table
aws dynamodb scan --table-name books --select COUNT --region us-east-1
aws dynamodb scan --table-name users --select COUNT --region us-east-1
aws dynamodb scan --table-name genres --select COUNT --region us-east-1
```

### **Test Application**
```bash
# Start with AWS DynamoDB
DATABASE_TYPE=dynamodb DYNAMODB_LOCAL=false npm run dev

# Test API endpoints
curl "http://localhost:3000/api/books?page=1&limit=5"
```

## 🔄 Switching Between Environments

### **Local Development**
```bash
DATABASE_TYPE=dynamodb DYNAMODB_LOCAL=true npm run dev
```

### **AWS Development**
```bash
DATABASE_TYPE=dynamodb DYNAMODB_LOCAL=false npm run dev
```

### **Production**
```bash
DATABASE_TYPE=dynamodb npm run dev
# (Uses IAM roles or environment variables)
```

## 🚨 Troubleshooting

### **Common Issues**

#### **Access Denied Errors**
- Verify IAM permissions
- Check access key validity
- Ensure region matches table location

#### **Table Not Found**
- Verify table names match exactly
- Check region configuration
- Ensure tables are active

#### **Credential Errors**
- Verify AWS credentials in `.env.local`
- Check AWS CLI configuration
- Ensure credentials have DynamoDB permissions

#### **Migration Failures**
- Check local DynamoDB is running
- Verify AWS credentials
- Check table schemas match

### **Debug Commands**
```bash
# Check AWS configuration
aws sts get-caller-identity

# List DynamoDB tables
aws dynamodb list-tables --region us-east-1

# Check table status
aws dynamodb describe-table --table-name books --region us-east-1
```

## 📚 Additional Resources

- [DynamoDB Developer Guide](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/)
- [AWS CLI DynamoDB Commands](https://docs.aws.amazon.com/cli/latest/reference/dynamodb/)
- [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

## 🎯 Next Steps

After successful migration:
1. **Monitor costs** in AWS Cost Explorer
2. **Set up CloudWatch** for table metrics
3. **Implement backup strategies** using DynamoDB point-in-time recovery
4. **Consider global tables** for multi-region deployment
5. **Set up DynamoDB Streams** for real-time data processing

## 🆘 Support

If you encounter issues:
1. Check AWS CloudTrail for API call logs
2. Review DynamoDB CloudWatch metrics
3. Check IAM permissions and policies
4. Verify table schemas and indexes
5. Test with AWS CLI commands first
