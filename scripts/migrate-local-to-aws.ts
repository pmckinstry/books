import * as dotenv from 'dotenv';
import * as path from 'path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create AWS DynamoDB client
const awsDynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const awsDocClient = DynamoDBDocumentClient.from(awsDynamoClient);

// Create local DynamoDB client
const localDynamoClient = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const localDocClient = DynamoDBDocumentClient.from(localDynamoClient);

async function migrateLocalToAWS() {
  console.log('🚀 Starting migration from Local DynamoDB to AWS DynamoDB...');
  
  try {
    // Verify AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not found in environment variables');
    }
    
    console.log(`📍 AWS Region: ${process.env.AWS_REGION || 'us-west-2'}`);
    console.log(`🔑 AWS Access Key: ${process.env.AWS_ACCESS_KEY_ID.substring(0, 8)}...`);
    
    const tables = ['users', 'books', 'genres', 'user_book_associations', 'reading_lists', 'reading_list_books'];
    
    for (const tableName of tables) {
      console.log(`\n📊 Migrating table: ${tableName}`);
      
      // Scan local table
      const localResult = await localDocClient.send(new ScanCommand({
        TableName: tableName
      }));
      
      const items = localResult.Items || [];
      console.log(`   Found ${items.length} items in local ${tableName}`);
      
      if (items.length === 0) {
        console.log(`   ⏭️  Skipping empty table ${tableName}`);
        continue;
      }
      
      // Migrate items to AWS
      let migratedCount = 0;
      for (const item of items) {
        try {
          // Convert numeric IDs to strings for users table
          if (tableName === 'users' && typeof item.id === 'number') {
            item.id = item.id.toString();
          }
          
          await awsDocClient.send(new PutCommand({
            TableName: tableName,
            Item: item
          }));
          migratedCount++;
        } catch (error: any) {
          console.error(`   ❌ Failed to migrate item in ${tableName}:`, error.message);
          // Continue with other items
        }
      }
      
      console.log(`   ✅ Successfully migrated ${migratedCount}/${items.length} items to AWS ${tableName}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Verification:');
    console.log('1. Check your AWS DynamoDB console to verify data');
    console.log('2. Update your .env.local to use AWS DynamoDB');
    console.log('3. Test your application with the cloud database');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateLocalToAWS();
}

export { migrateLocalToAWS };
