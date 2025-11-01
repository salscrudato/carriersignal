import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "../../serviceAccountKey.json");
if (!fs.existsSync(serviceAccountPath)) {
  console.error("serviceAccountKey.json not found. Please ensure it exists.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Import the comprehensive ingestion function
import { comprehensiveIngestionWithAI } from "../src/index";

async function main() {
  try {
    console.log("🚀 Starting manual comprehensive ingestion...");
    
    // Get OpenAI API key from environment
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY environment variable not set");
      process.exit(1);
    }
    
    // Call the comprehensive ingestion function
    const stats = await comprehensiveIngestionWithAI(apiKey);
    
    console.log("✅ Comprehensive ingestion completed!");
    console.log("📊 Stats:", stats);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during comprehensive ingestion:", error);
    process.exit(1);
  }
}

main();

