console.log('=== Firebase Configuration Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NEXT_PUBLIC_FIREBASE_API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
console.log('NEXT_PUBLIC_FIREBASE_APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
console.log('DATABASE_TYPE:', process.env.DATABASE_TYPE);
console.log('FIREBASE_USE_EMULATOR:', process.env.FIREBASE_USE_EMULATOR);

// Test if we can import Firebase
try {
  const { db } = require('../src/lib/firebase');
  console.log('✅ Firebase imported successfully');
  console.log('Database instance:', db ? 'CREATED' : 'FAILED');
} catch (error) {
  console.error('❌ Failed to import Firebase:', error);
}
