import {initializeApp} from "firebase/app";
import {getFirestore} from "firebase/firestore";
import {getFunctions} from "firebase/functions";

export const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});
export const db = getFirestore(app);

// Initialize Firebase Functions - always connects to live production functions
// Region: us-central1 (where your functions are deployed)
export const functions = getFunctions(app, "us-central1");

