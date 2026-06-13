import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

/**
 * Firebase Admin SDK — used to verify phone-auth ID tokens minted on the
 * client. Initialised lazily and only when service-account credentials are
 * present, so the app still boots in environments without Firebase configured.
 * Reuses the existing FIREBASE_* admin env vars (already used for FCM).
 */
if (!getApps().length && process.env.FIREBASE_PROJECT_ID) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export const firebaseAuth = getApps().length > 0 ? getAuth() : null;
