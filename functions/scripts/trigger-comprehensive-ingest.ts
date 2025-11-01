/**
 * Trigger comprehensive ingestion with AI enhancement
 * This script manually triggers the comprehensive ingestion pipeline
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../../serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('serviceAccountKey.json not found. Please ensure it exists in the project root.');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'carriersignal-app',
});

const db = admin.firestore();

async function triggerComprehensiveIngest() {
  console.log('🚀 Triggering comprehensive ingestion with AI enhancement...');
  
  try {
    // Call the Cloud Function via Firestore trigger
    // We'll write a document to trigger the function
    const triggerRef = db.collection('_triggers').doc('comprehensive_ingest');
    
    await triggerRef.set({
      triggered: true,
      timestamp: new Date(),
      status: 'pending',
    });
    
    console.log('✅ Comprehensive ingestion triggered!');
    console.log('📊 The function will run in the background and populate the database with AI-enhanced articles.');
    console.log('⏱️  This may take 5-15 minutes depending on the number of sources and articles.');
    console.log('📈 Monitor progress in Firebase Console: https://console.firebase.google.com/project/carriersignal-app/firestore');
    
    // Wait a bit and check status
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const status = await triggerRef.get();
    console.log('\n📋 Current status:', status.data());
    
  } catch (error) {
    console.error('❌ Error triggering ingestion:', error);
    process.exit(1);
  }
}

triggerComprehensiveIngest().then(() => {
  console.log('\n✨ Done! Check the Firebase Console for ingestion progress.');
  process.exit(0);
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

