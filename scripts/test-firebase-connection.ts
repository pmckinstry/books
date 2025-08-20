import { db } from '../src/lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

async function testFirebaseConnection() {
  console.log('Testing Firebase connection...');
  
  try {
    // Test 1: Simple document creation
    console.log('Test 1: Creating a simple test document...');
    const testData = {
      name: 'Test Genre',
      description: 'A test genre for debugging',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'test_genres'), testData);
    console.log('✅ Successfully created test document with ID:', docRef.id);
    
    // Test 2: Reading documents
    console.log('Test 2: Reading documents...');
    const querySnapshot = await getDocs(collection(db, 'test_genres'));
    console.log('✅ Successfully read', querySnapshot.size, 'documents');
    
    // Test 3: Clean up
    console.log('Test 3: Cleaning up test data...');
    // Note: We can't delete in this test, but the emulator will reset on restart
    
    console.log('🎉 All Firebase tests passed!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    console.error('Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      stack: (error as any).stack
    });
  }
}

// Run the test
testFirebaseConnection();
