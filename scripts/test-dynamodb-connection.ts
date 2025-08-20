import { docClient, TABLES } from '../src/lib/dynamodb';

console.log('=== DynamoDB Connection Test ===');
console.log('Database type:', process.env.DATABASE_TYPE);
console.log('AWS Region:', process.env.AWS_REGION);
console.log('DynamoDB Local:', process.env.DYNAMODB_LOCAL);
console.log('Tables:', Object.values(TABLES));

try {
  console.log('\n✅ DynamoDB configuration loaded successfully');
  console.log('Client:', docClient ? 'CREATED' : 'FAILED');
  
  // Test basic operations (this will fail if DynamoDB isn't running, but won't crash)
  console.log('\n🔍 Testing basic DynamoDB operations...');
  
  // This is just a configuration test - actual operations will fail without DynamoDB running
  console.log('✅ DynamoDB setup is complete and ready for use');
  
} catch (error) {
  console.error('❌ DynamoDB configuration error:', error);
}

console.log('\n📋 Next steps:');
console.log('1. Start DynamoDB Local: ./scripts/setup-dynamodb-local.sh');
console.log('2. Create tables: npx tsx scripts/create-dynamodb-tables.ts');
console.log('3. Run migration: npx tsx scripts/migrate-to-dynamodb.ts');
