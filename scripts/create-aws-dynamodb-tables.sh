#!/bin/bash

# AWS DynamoDB Table Creation Script
# Make sure you have AWS CLI configured with appropriate permissions

echo "Creating DynamoDB tables in AWS..."

# Set your preferred region
REGION="us-west-2"

# Create Users table
echo "Creating users table..."
aws dynamodb create-table \
    --table-name users \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=username,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[{\"IndexName\":\"username-index\",\"KeySchema\":[{\"AttributeName\":\"username\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

# Create Books table
echo "Creating books table..."
aws dynamodb create-table \
    --table-name books \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=title,AttributeType=S \
        AttributeName=author,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[{\"IndexName\":\"title-author-index\",\"KeySchema\":[{\"AttributeName\":\"title\",\"KeyType\":\"HASH\"},{\"AttributeName\":\"author\",\"KeyType\":\"RANGE\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

# Create Genres table
echo "Creating genres table..."
aws dynamodb create-table \
    --table-name genres \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=name,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[{\"IndexName\":\"name-index\",\"KeySchema\":[{\"AttributeName\":\"name\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

# Create User Book Associations table
echo "Creating user_book_associations table..."
aws dynamodb create-table \
    --table-name user_book_associations \
    --attribute-definitions \
        AttributeName=user_id,AttributeType=S \
        AttributeName=book_id,AttributeType=S \
    --key-schema AttributeName=user_id,KeyType=HASH AttributeName=book_id,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

# Create Reading Lists table
echo "Creating reading_lists table..."
aws dynamodb create-table \
    --table-name reading_lists \
    --attribute-definitions \
        AttributeName=id,AttributeType=S \
        AttributeName=user_id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --global-secondary-indexes \
        "[{\"IndexName\":\"user_id-index\",\"KeySchema\":[{\"AttributeName\":\"user_id\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

# Create Reading List Books table
echo "Creating reading_list_books table..."
aws dynamodb create-table \
    --table-name reading_list_books \
    --attribute-definitions \
        AttributeName=reading_list_id,AttributeType=S \
        AttributeName=book_id,AttributeType=S \
    --key-schema AttributeName=reading_list_id,KeyType=HASH AttributeName=book_id,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
    --region $REGION

echo "All tables created! Waiting for tables to be active..."

# Wait for tables to be active
aws dynamodb wait table-exists --table-name users --region $REGION
aws dynamodb wait table-exists --table-name books --region $REGION
aws dynamodb wait table-exists --table-name genres --region $REGION
aws dynamodb wait table-exists --table-name user_book_associations --region $REGION
aws dynamodb wait table-exists --table-name reading_lists --region $REGION
aws dynamodb wait table-exists --table-name reading_list_books --region $REGION

echo "✅ All tables are now active and ready for use!"
echo ""
echo "📋 Next steps:"
echo "1. Update your .env.local file with AWS credentials"
echo "2. Set DATABASE_TYPE=dynamodb and DYNAMODB_LOCAL=false"
echo "3. Run the migration script to transfer data from local DynamoDB to AWS"
