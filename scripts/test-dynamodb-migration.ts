import * as dotenv from 'dotenv';
import * as path from 'path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Load environment variables first
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Create DynamoDB client with local configuration
const dynamoClient = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

async function testMigration() {
  console.log('=== Testing DynamoDB Migration ===');
  
  try {
    // Test scanning each table
    const tables = ['users', 'books', 'genres', 'user_book_associations', 'reading_lists', 'reading_list_books'];
    
    for (const tableName of tables) {
      console.log(`\n📊 Scanning table: ${tableName}`);
      
      const result = await docClient.send(new ScanCommand({
        TableName: tableName
      }));
      
      console.log(`✅ ${tableName}: ${result.Items?.length || 0} items`);
      
      // Show first few items as sample
      if (result.Items && result.Items.length > 0) {
        console.log(`   Sample item:`, JSON.stringify(result.Items[0], null, 2).substring(0, 200) + '...');
      }
    }
    
    console.log('\n🎉 Migration verification complete!');
    
  } catch (error: any) {
    console.error('❌ Error testing migration:', error.message);
  }
}

// Run the test
testMigration();
