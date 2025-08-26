import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
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

// Complete list of all genres including the new ones
const allGenres = [
  { name: 'Classic', description: 'Timeless literary works that have stood the test of time and continue to be widely read and studied.' },
  { name: 'Dystopian', description: 'Fiction set in a society characterized by oppression, totalitarianism, or other negative social conditions.' },
  { name: 'Romance', description: 'Stories focused on romantic relationships and emotional connections between characters.' },
  { name: 'Fantasy', description: 'Fiction featuring magical elements, supernatural creatures, and imaginary worlds.' },
  { name: 'Adventure', description: 'Stories involving exciting journeys, quests, and thrilling experiences.' },
  { name: 'Horror', description: 'Fiction designed to frighten, scare, or startle readers through supernatural or psychological elements.' },
  { name: 'Science Fiction', description: 'Fiction that explores futuristic concepts, advanced technology, and scientific possibilities.' },
  { name: 'Satire', description: 'Works that use humor, irony, or exaggeration to criticize or expose flaws in society.' },
  { name: 'Historical', description: 'Fiction set in the past, often incorporating real historical events and figures.' },
  { name: 'Philosophy', description: 'Works that explore fundamental questions about existence, knowledge, values, and reality.' },
  { name: 'Children', description: 'Literature written specifically for young readers, often featuring educational or moral themes.' },
  { name: 'Poetry', description: 'Literary works that use rhythm, meter, and figurative language to express ideas and emotions.' },
  { name: 'Drama', description: 'Works written for performance, typically featuring dialogue and stage directions.' },
  { name: 'Mystery', description: 'Stories involving puzzles, crimes, or unexplained events that require investigation.' },
  { name: 'Nonfiction', description: 'Factual works based on real events, people, or information rather than fictional stories.' },
  { name: 'Fiction', description: 'Imaginative works of prose that are not based on real events or people, including novels, short stories, and novellas.' },
  { name: 'Tragedy', description: 'Dramatic works that depict the downfall of a noble character due to a tragic flaw or fate, often ending in death or destruction.' }
];

async function clearGenresTable() {
  try {
    console.log('🗑️  Clearing existing genres...');
    
    const result = await docClient.send(new ScanCommand({
      TableName: 'genres'
    }));
    
    if (result.Items && result.Items.length > 0) {
      console.log(`Found ${result.Items.length} existing genres to delete...`);
      
      for (const item of result.Items) {
        await docClient.send(new DeleteCommand({
          TableName: 'genres',
          Key: { id: item.id }
        }));
      }
      
      console.log('✅ All existing genres cleared');
    } else {
      console.log('ℹ️  No existing genres found');
    }
  } catch (error) {
    console.error('❌ Error clearing genres:', error);
    throw error;
  }
}

async function addAllGenres() {
  try {
    console.log('\n📚 Adding all genres to DynamoDB...');
    
    const genreMap: Record<string, string> = {};
    
    for (const genre of allGenres) {
      const genreId = uuidv4();
      genreMap[genre.name] = genreId;
      
      console.log(`Adding genre: ${genre.name}`);
      
      await docClient.send(new PutCommand({
        TableName: 'genres',
        Item: {
          id: genreId,
          name: genre.name,
          description: genre.description
        }
      }));
      
      console.log(`✅ Successfully added genre: ${genre.name} (ID: ${genreId})`);
    }
    
    console.log('\n🎉 All genres added successfully!');
    console.log('\n📋 Genre ID mapping:');
    Object.entries(genreMap).forEach(([name, id]) => {
      console.log(`  ${name}: ${id}`);
    });
    
    return genreMap;
  } catch (error) {
    console.error('❌ Error adding genres:', error);
    throw error;
  }
}

async function reinitializeDatabase() {
  try {
    console.log('🚀 Starting database re-initialization...\n');
    
    // Clear existing genres
    await clearGenresTable();
    
    // Add all genres
    const genreMap = await addAllGenres();
    
    console.log('\n✨ Database re-initialization completed successfully!');
    console.log(`📊 Total genres: ${allGenres.length}`);
    
    // Save genre mapping to a file for reference
    const fs = require('fs');
    const mappingData = {
      timestamp: new Date().toISOString(),
      totalGenres: allGenres.length,
      genres: genreMap
    };
    
    fs.writeFileSync('genre-mapping.json', JSON.stringify(mappingData, null, 2));
    console.log('\n💾 Genre mapping saved to genre-mapping.json');
    
  } catch (error) {
    console.error('❌ Database re-initialization failed:', error);
    process.exit(1);
  }
}

// Run the script
reinitializeDatabase();
