// Debug script to check DynamoDB connection and users
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

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

const docClient = DynamoDBDocumentClient.from(client);

async function debugUsers() {
  try {
    console.log('Checking DynamoDB connection...');
    console.log('Region:', process.env.AWS_REGION || 'us-east-1');
    console.log('Local:', process.env.DYNAMODB_LOCAL === 'true');
    
    // Try to scan the users table
    const result = await docClient.send(new ScanCommand({
      TableName: 'users'
    }));
    
    console.log('Users found:', result.Items?.length || 0);
    if (result.Items && result.Items.length > 0) {
      console.log('First user:', {
        id: result.Items[0].id,
        username: result.Items[0].username,
        idType: typeof result.Items[0].id
      });
    }
    
  } catch (error) {
    console.error('Error connecting to DynamoDB:', error);
  }
}

debugUsers();
