// Firebase Admin SDK — SERVER SIDE ONLY (API routes)
// Never import this in client components or pages

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  // Return existing app if already initialized (prevents re-init on hot reload)
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || '';
  const privateKey = rawKey
    .replace(/^["']|["']$/g, '')   // strip surrounding quotes if any
    .replace(/\\n/g, '\n');         // convert \n text to real newlines

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export default adminApp;
