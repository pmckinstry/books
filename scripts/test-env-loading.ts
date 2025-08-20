import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
console.log('Loading environment from:', envPath);

const result = dotenv.config({ path: envPath });
console.log('Environment loaded:', result.parsed ? 'SUCCESS' : 'FAILED');

console.log('\n=== Environment Variables ===');
console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('DYNAMODB_LOCAL:', process.env.DYNAMODB_LOCAL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test DynamoDB configuration
console.log('\n=== Testing DynamoDB Config ===');
const { docClient } = require('../src/lib/dynamodb');
console.log('DynamoDB client created:', docClient ? 'SUCCESS' : 'FAILED');
