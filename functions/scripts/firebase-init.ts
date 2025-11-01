/**
 * Shared Firebase Admin Initialization
 * Used by all seed and utility scripts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export function initializeFirebase() {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    // Use service account key if available
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Using service account key for Firebase authentication');
  } else {
    // Use default credentials (works with Firebase CLI authentication)
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'carriersignal-app',
    });
    console.log('✅ Using default credentials for Firebase authentication');
  }
}

export function getDb() {
  return admin.firestore();
}

