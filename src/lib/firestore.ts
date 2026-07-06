import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { PLAYERS } from "@/data/players";

export interface FirestoreUser {
  uid: string;
  username: string;
  displayName: string;
  avatar: string;
  playerId: string;
  groupPoints: number;
  knockoutPoints: number;
  totalPoints: number;
  correctPredictions: number;
  r32Points: number;
  r16Points: number;
  qfPoints: number;
  sfPoints: number;
  finalPoints: number;
  createdAt: Timestamp | null;
}

export interface FirestorePrediction {
  matchId: string;
  winner: string;
  submittedAt: Timestamp | null;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function createUserProfile(
  uid: string,
  username: string,
  displayName: string,
  avatar: string,
  playerId: string,
) {
  const database = db();
  const userRef = doc(database, "users", uid);
  const existing = await getDoc(userRef);
  if (existing.exists()) return;

  const staticPlayer = PLAYERS.find((p) => p.id === playerId);

  await setDoc(userRef, {
    uid,
    username,
    displayName,
    avatar,
    playerId,
    groupPoints: staticPlayer?.groupPoints ?? 0,
    knockoutPoints: staticPlayer?.knockoutPoints ?? 0,
    totalPoints: staticPlayer?.totalPoints ?? 0,
    correctPredictions: staticPlayer?.correctPredictions ?? 0,
    r32Points: staticPlayer?.r32Points ?? 0,
    r16Points: staticPlayer?.r16Points ?? 0,
    qfPoints: staticPlayer?.qfPoints ?? 0,
    sfPoints: staticPlayer?.sfPoints ?? 0,
    finalPoints: staticPlayer?.finalPoints ?? 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(
  uid: string,
): Promise<FirestoreUser | null> {
  const database = db();
  const snap = await getDoc(doc(database, "users", uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

export function subscribeToLeaderboard(
  callback: (users: FirestoreUser[]) => void,
): () => void {
  try {
    const database = db();
    const q = query(
      collection(database, "users"),
      orderBy("totalPoints", "desc"),
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map((d) => d.data() as FirestoreUser));
    });
  } catch {
    return () => {};
  }
}

// ─── Predictions ──────────────────────────────────────────────────────────────

export async function savePrediction(
  uid: string,
  matchId: string,
  winner: string,
) {
  const database = db();
  const predRef = doc(database, "predictions", uid, "matches", matchId);
  await setDoc(predRef, { matchId, winner, submittedAt: serverTimestamp() });
}

export async function deletePrediction(uid: string, matchId: string) {
  const database = db();
  const predRef = doc(database, "predictions", uid, "matches", matchId);
  await deleteDoc(predRef);
}

export function subscribeToUserPredictions(
  uid: string,
  callback: (predictions: Record<string, FirestorePrediction>) => void,
): () => void {
  try {
    const database = db();
    const predCol = collection(database, "predictions", uid, "matches");
    return onSnapshot(predCol, (snapshot) => {
      const predictions: Record<string, FirestorePrediction> = {};
      snapshot.docs.forEach((d) => {
        predictions[d.id] = d.data() as FirestorePrediction;
      });
      callback(predictions);
    });
  } catch {
    return () => {};
  }
}

// ─── Admin: award points after a match completes ──────────────────────────────

export async function awardPointsToUser(
  uid: string,
  fields: Partial<
    Pick<
      FirestoreUser,
      | "r16Points"
      | "qfPoints"
      | "sfPoints"
      | "finalPoints"
      | "correctPredictions"
      | "knockoutPoints"
      | "totalPoints"
    >
  >,
) {
  const database = db();
  const userRef = doc(database, "users", uid);
  await updateDoc(userRef, fields as Record<string, unknown>);
}
