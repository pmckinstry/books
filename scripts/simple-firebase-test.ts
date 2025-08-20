import { db } from '../src/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

async function simpleTest() {
  console.log('Testing with minimal data...');
  
  try {
    // Test with just a string field
    const simpleData = {
      name: 'Test'
    };
    
    console.log('Attempting to create document with data:', simpleData);
    const docRef = await addDoc(collection(db, 'test'), simpleData);
    console.log('✅ Success! Document created with ID:', docRef.id);
    
  } catch (error) {
    console.error('❌ Failed:', error);
    console.error('Error code:', (error as any).code);
    console.error('Error message:', (error as any).message);
  }
}

simpleTest();

