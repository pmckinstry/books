import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

async function testDynamoDB() {
  console.log('=== Simple DynamoDB Test ===');

  // Force local configuration
  const dynamoConfig = {
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'dummy',
      secretAccessKey: 'dummy'
    }
  };

  console.log('Config:', JSON.stringify(dynamoConfig, null, 2));

  try {
    // Create client
    const client = new DynamoDBClient(dynamoConfig);
    const docClient = DynamoDBDocumentClient.from(client);
    
    console.log('✅ DynamoDB client created successfully');
    
    // Test a simple operation
    console.log('Testing ListTables operation...');
    
    const { ListTablesCommand } = require('@aws-sdk/client-dynamodb');
    const result = await client.send(new ListTablesCommand({}));
    
    console.log('✅ ListTables successful!');
    console.log('Tables:', result.TableNames || []);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Error type:', error.constructor.name);
    console.error('Full error:', error);
  }
}

// Run the test
testDynamoDB();
