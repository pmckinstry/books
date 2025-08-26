import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Configure DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const docClient = DynamoDBDocumentClient.from(client);

// New genres to add
const newGenres = [
  {
    id: uuidv4(),
    name: 'Fiction',
    description: 'Imaginative works of prose that are not based on real events or people, including novels, short stories, and novellas.'
  },
  {
    id: uuidv4(),
    name: 'Tragedy',
    description: 'Dramatic works that depict the downfall of a noble character due to a tragic flaw or fate, often ending in death or destruction.'
  }
];

async function addNewGenres() {
  try {
    console.log('Adding new genres to DynamoDB...');
    
    for (const genre of newGenres) {
      console.log(`Adding genre: ${genre.name}`);
      
      await docClient.send(new PutCommand({
        TableName: 'genres',
        Item: genre
      }));
      
      console.log(`✅ Successfully added genre: ${genre.name} (ID: ${genre.id})`);
    }
    
    console.log('\n🎉 All new genres added successfully!');
    console.log('\nNew genre IDs:');
    newGenres.forEach(genre => {
      console.log(`  ${genre.name}: ${genre.id}`);
    });
    
  } catch (error) {
    console.error('❌ Error adding genres:', error);
    process.exit(1);
  }
}

// Run the script
addNewGenres();
