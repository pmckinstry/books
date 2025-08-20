#!/bin/bash

# Script to update environment variables for AWS DynamoDB

echo "🔧 Updating environment configuration for AWS DynamoDB..."

# Backup current .env.local
if [ -f .env.local ]; then
    cp .env.local .env.local.backup
    echo "✅ Backed up current .env.local to .env.local.backup"
fi

# Create new .env.local for AWS
cat > .env.local << EOF
# AWS DynamoDB Configuration
DATABASE_TYPE=dynamodb
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=YOUR_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_SECRET_KEY_HERE
DYNAMODB_LOCAL=false

# Note: Replace YOUR_ACCESS_KEY_HERE and YOUR_SECRET_KEY_HERE with your actual AWS credentials
EOF

echo "✅ Created new .env.local for AWS DynamoDB"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env.local and replace the placeholder credentials with your actual AWS credentials"
echo "2. Run: ./scripts/create-aws-dynamodb-tables.sh"
echo "3. Run: npx tsx scripts/migrate-local-to-aws.ts"
echo "4. Test your application with: npm run dev"
echo ""
echo "⚠️  Important: Never commit your AWS credentials to version control!"
echo "   Consider using AWS IAM roles or environment variables in production."
