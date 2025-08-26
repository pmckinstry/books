# Firebase Setup and Migration Guide

This guide will help you set up Firebase Cloud Firestore for your books application and migrate from SQLite.

## Prerequisites

- Node.js and npm installed
- A Firebase account
- Your existing SQLite database with data

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enter a project name (e.g., "books-app")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### 1.2 Enable Firestore Database
1. In the Firebase console, click "Firestore Database" in the left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (you can add security rules later)
4. Select a location close to your users
5. Click "Done"

### 1.3 Get Firebase Configuration
1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname
6. Copy the configuration object

## Step 2: Environment Configuration

### 2.1 Update .env.local
Replace the placeholder values in your `.env.local` file with your actual Firebase configuration:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Database Type (set to 'firebase' to use Firebase)
DATABASE_TYPE=firebase
```

### 2.2 Verify Configuration
Make sure your `src/lib/firebase.ts` file is properly configured with these environment variables.

## Step 3: Install Dependencies

The Firebase dependency should already be installed. If not, run:

```bash
npm install firebase
```

## Step 4: Deploy Firestore Rules and Indexes

### 4.1 Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 4.2 Login to Firebase
```bash
firebase login
```

### 4.3 Initialize Firebase in Your Project
```bash
firebase init
```

Select the following options:
- Choose "Firestore" and "Hosting" (optional)
- Select your project
- Use default file names for rules and indexes
- Set public directory to `out` (if using hosting)

### 4.4 Deploy Rules and Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Step 5: Data Migration

### 5.1 Run Migration Script
```bash
npx tsx scripts/migrate-to-firebase.ts
```

This script will:
- Migrate all genres
- Migrate all users (with default password "changeme123")
- Migrate all books with their genre associations
- Migrate user-book associations
- Migrate reading lists and their books

### 5.2 Verify Migration
Check your Firebase console to ensure all data has been migrated correctly.

## Step 6: Update API Routes

### 6.1 Update Import Statements
Change all imports from:
```typescript
import { ... } from '@/lib/database';
```

To:
```typescript
import { ... } from '@/lib/database-factory';
```

### 6.2 Handle Async Operations
Most Firebase operations are async, so you'll need to add `await` keywords where appropriate.

## Step 7: Test the Application

### 7.1 Start Development Server
```bash
npm run dev
```

### 7.2 Test Basic Functionality
- User registration and login
- Book creation and retrieval
- Genre management
- Reading list operations

## Step 8: Security and Production

### 8.1 Update Security Rules
Review and modify `firestore.rules` based on your security requirements.

### 8.2 Set Up Authentication (Optional)
If you want to use Firebase Authentication instead of custom auth:
1. Enable Authentication in Firebase console
2. Choose your sign-in methods
3. Update the auth logic in your application

### 8.3 Production Deployment
1. Update security rules for production
2. Set up proper indexes
3. Configure backup and monitoring
4. Set up Firebase App Check for additional security

## Configuration Options

### Switch Between Databases
You can easily switch between Firebase and SQLite by changing the `DATABASE_TYPE` environment variable:

```bash
# Use Firebase
DATABASE_TYPE=firebase

# Use SQLite
DATABASE_TYPE=sqlite
```

### Firebase Emulator (Development)
For local development, you can use Firebase emulators:

1. Start emulators:
```bash
firebase emulators:start
```

2. Uncomment emulator connection in `src/lib/firebase.ts`:
```typescript
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check your environment variables and Firebase configuration
2. **Permission denied**: Verify your Firestore security rules
3. **Index errors**: Deploy the indexes using `firebase deploy --only firestore:indexes`
4. **Migration failures**: Check the console output for specific error messages

### Performance Considerations

1. **Indexes**: Ensure all your queries have proper indexes
2. **Batch operations**: Use batch writes for multiple operations
3. **Pagination**: Implement proper pagination for large datasets
4. **Caching**: Consider implementing client-side caching for frequently accessed data

## Migration Rollback

If you need to rollback to SQLite:

1. Set `DATABASE_TYPE=sqlite` in your `.env.local`
2. Restart your application
3. Your SQLite data should still be intact

## Support

For Firebase-specific issues:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

For application-specific issues, check your application logs and the migration script output.
