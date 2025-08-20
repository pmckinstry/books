import * as dotenv from 'dotenv';
import * as path from 'path';
import { TABLES, TABLE_SCHEMAS } from '../src/lib/dynamodb';
import { CreateTableCommand, ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

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

async function createTables() {
  console.log('Creating DynamoDB tables...');
  
  try {
    // List existing tables
    const listResult = await dynamoClient.send(new ListTablesCommand({}));
    const existingTables = listResult.TableNames || [];
    console.log('Existing tables:', existingTables);
    
    // Create tables that don't exist
    for (const [tableName, schema] of Object.entries(TABLE_SCHEMAS)) {
      if (existingTables.includes(tableName)) {
        console.log(`✅ Table ${tableName} already exists`);
        continue;
      }
      
      console.log(`🚀 Creating table: ${tableName}`);
      
      try {
        await dynamoClient.send(new CreateTableCommand(schema));
        console.log(`✅ Table ${tableName} created successfully`);
        
        // Wait a bit for table to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        if (error.name === 'ResourceInUseException') {
          console.log(`✅ Table ${tableName} already exists`);
        } else {
          console.error(`❌ Failed to create table ${tableName}:`, error.message);
        }
      }
    }
    
    console.log('\n🎉 All tables created successfully!');
    console.log('\nTables:');
    for (const tableName of Object.values(TABLES)) {
      console.log(`- ${tableName}`);
    }
    
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (require.main === module) {
  createTables();
}

export { createTables };
