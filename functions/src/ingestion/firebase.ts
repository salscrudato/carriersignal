/**
 * Firebase Configuration for Ingestion Service
 * Provides Firestore instance for ingestion operations
 */

import { getFirestore } from 'firebase-admin/firestore';

export const db = getFirestore();

