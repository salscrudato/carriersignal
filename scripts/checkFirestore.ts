import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore(app);

async function checkArticles() {
  try {
    console.log('🔍 Checking Firestore articles collection...\n');
    
    // Try to get articles ordered by createdAt
    const q = query(
      collection(db, 'articles'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`✅ Found ${snapshot.size} articles\n`);
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`[${index + 1}] ${data.title}`);
      console.log(`    Published: ${data.publishedAt}`);
      console.log(`    Created: ${data.createdAt?.toDate()}`);
      console.log(`    Smart Score: ${data.smartScore}`);
      console.log(`    AI Score: ${data.aiScore}`);
      console.log('');
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'failed-precondition') {
      console.log('\n⚠️  This error means you need to create a Firestore index!');
      console.log('Check the error message for the index creation link.');
    }
  }
  
  process.exit(0);
}

checkArticles();

