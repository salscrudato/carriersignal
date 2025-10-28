import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

const db = getFirestore(app);

async function clearArticles() {
  console.log('🗑️  Clearing articles collection...\n');
  
  try {
    const articlesRef = collection(db, 'articles');
    const snapshot = await getDocs(articlesRef);
    
    console.log(`Found ${snapshot.size} articles to delete\n`);
    
    if (snapshot.size === 0) {
      console.log('✅ Database is already empty');
      process.exit(0);
    }
    
    let deleted = 0;
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, 'articles', docSnapshot.id));
      deleted++;
      if (deleted % 10 === 0) {
        console.log(`   Deleted ${deleted}/${snapshot.size} articles...`);
      }
    }
    
    console.log(`\n✅ Successfully deleted ${deleted} articles`);
    console.log('Database is now clear and ready for repopulation\n');
    
  } catch (error: any) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
  
  process.exit(0);
}

clearArticles();

