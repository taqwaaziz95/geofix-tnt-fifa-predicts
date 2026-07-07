/**
 * Firebase Admin SDK — server-side only.
 * Initialized lazily from the FIREBASE_SERVICE_ACCOUNT_JSON env var.
 */
import { App, getApps, initializeApp } from "firebase-admin/app";
import { cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let _app: App | undefined;
let _db: Firestore | undefined;

function getAdminApp(): App {
  if (_app) return _app;
  const existing = getApps();
  if (existing.length > 0) {
    _app = existing[0];
    return _app;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON env var");
  const sa = JSON.parse(raw);
  _app = initializeApp({ credential: cert(sa), projectId: sa.project_id });
  return _app;
}

export function adminDb(): Firestore {
  if (!_db) {
    getAdminApp();
    _db = getFirestore();
  }
  return _db;
}
