import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

/**
 * Browser-side Firebase app, used only for phone (SMS) auth. All values are
 * NEXT_PUBLIC_* so they're inlined into the client bundle. The resulting ID
 * token is verified server-side by firebase-admin before we issue our own JWT.
 */
export function getFirebaseClientAuth() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return null;

  const app: FirebaseApp =
    getApps().length === 0
      ? initializeApp({
          apiKey,
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        })
      : getApps()[0]!;

  return getAuth(app);
}
