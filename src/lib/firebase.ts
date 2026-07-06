import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Only initialize on the client side and when config is present
function getApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.apiKey) return null;
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth | null {
  const app = getApp();
  return app ? getAuth(app) : null;
}

export function getFirebaseDb(): Firestore | null {
  const app = getApp();
  return app ? getFirestore(app) : null;
}

// Lazy singletons — safe to use in client components
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function auth(): Auth {
  if (!_auth) {
    const a = getFirebaseAuth();
    if (!a)
      throw new Error(
        "Firebase Auth not available. Check your .env.local file.",
      );
    _auth = a;
  }
  return _auth;
}

export function db(): Firestore {
  if (!_db) {
    const d = getFirebaseDb();
    if (!d)
      throw new Error("Firestore not available. Check your .env.local file.");
    _db = d;
  }
  return _db;
}
