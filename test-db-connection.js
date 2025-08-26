// Test script to check DynamoDB connection and table existence
import { DynamoDBClient, ListTablesCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.DYNAMODB_LOCAL === 'true' && {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local'
    }
  })
});

async function testConnection() {
  try {
    console.log('Testing DynamoDB connection...');
    console.log('Region:', process.env.AWS_REGION || 'us-east-1');
    console.log('Local:', process.env.DYNAMODB_LOCAL === 'true');
    
    // List all tables
    const listResult = await client.send(new ListTablesCommand({}));
    console.log('Available tables:', listResult.TableNames);
    
    // Check if users table exists
    if (listResult.TableNames && listResult.TableNames.includes('users')) {
      console.log('Users table exists, checking structure...');
      
      try {
        const describeResult = await client.send(new DescribeTableCommand({
          TableName: 'users'
        }));
        console.log('Users table structure:', {
          status: describeResult.Table?.TableStatus,
          itemCount: describeResult.Table?.ItemCount,
          keySchema: describeResult.Table?.KeySchema
        });
      } catch (error) {
        console.error('Error describing users table:', error);
      }
    } else {
      console.log('Users table does not exist!');
    }
    
  } catch (error) {
    console.error('Error connecting to DynamoDB:', error);
  }
}

testConnection();
