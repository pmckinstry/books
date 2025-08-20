import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export async function GET() {
  try {
    console.log('Testing Firebase connection from Next.js API...');
    
    // Test with minimal data
    const testData = {
      name: 'Test from Next.js API',
      timestamp: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'test'), testData);
    
    return NextResponse.json({
      success: true,
      message: 'Firebase connection successful!',
      documentId: docRef.id,
      data: testData
    });
    
  } catch (error) {
    console.error('Firebase test failed:', error);
    
    return NextResponse.json({
      success: false,
      error: (error as any).message,
      code: (error as any).code
    }, { status: 500 });
  }
}
