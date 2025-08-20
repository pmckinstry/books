#!/bin/bash

echo "Setting up DynamoDB Local..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if DynamoDB Local container is already running
if docker ps | grep -q "dynamodb-local"; then
    echo "✅ DynamoDB Local is already running"
else
    echo "🚀 Starting DynamoDB Local container..."
    docker run -d \
        --name dynamodb-local \
        -p 8000:8000 \
        amazon/dynamodb-local:latest \
        -jar DynamoDBLocal.jar -sharedDb -inMemory
    
    echo "⏳ Waiting for DynamoDB Local to start..."
    sleep 5
fi

# Check if container is running
if docker ps | grep -q "dynamodb-local"; then
    echo "✅ DynamoDB Local is running on http://localhost:8000"
else
    echo "❌ Failed to start DynamoDB Local"
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Run the migration script: npx tsx scripts/migrate-to-dynamodb.ts"
echo "2. Test your application with DynamoDB"
echo ""
echo "To stop DynamoDB Local: docker stop dynamodb-local"
echo "To remove DynamoDB Local: docker rm dynamodb-local"
