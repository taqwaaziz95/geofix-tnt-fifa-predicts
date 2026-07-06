"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createUserProfile,
  getUserProfile,
  subscribeToUserPredictions,
  savePrediction,
  deletePrediction,
  FirestoreUser,
  FirestorePrediction,
} from "@/lib/firestore";
import { usernameToEmail, PLAYER_ROSTER } from "@/lib/auth-config";

interface AuthContextValue {
  user: User | null;
  profile: FirestoreUser | null;
  predictions: Record<string, FirestorePrediction>;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  predict: (matchId: string, winner: string) => Promise<void>;
  removePredict: (matchId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [predictions, setPredictions] = useState<
    Record<string, FirestorePrediction>
  >({});
  const [loading, setLoading] = useState(true);

  // ── Auth state listener ────────────────────────────────────────────────────
  useEffect(() => {
    let firebaseAuth;
    try {
      firebaseAuth = auth();
    } catch {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
        setPredictions({});
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Predictions real-time listener ────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserPredictions(user.uid, setPredictions);
    return unsub;
  }, [user]);

  // ── Sign in ────────────────────────────────────────────────────────────────
  const signIn = useCallback(async (username: string, password: string) => {
    const email = usernameToEmail(username);
    const credential = await signInWithEmailAndPassword(
      auth(),
      email,
      password,
    );
    const firebaseUser = credential.user;

    // Ensure Firestore profile exists (first login)
    const roster = PLAYER_ROSTER[username.toLowerCase()];
    if (roster) {
      await createUserProfile(
        firebaseUser.uid,
        username.toLowerCase(),
        roster.displayName,
        roster.avatar,
        roster.playerId,
      );
    }

    const p = await getUserProfile(firebaseUser.uid);
    setProfile(p);
  }, []);

  // ── Sign out ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    await firebaseSignOut(auth());
    setProfile(null);
    setPredictions({});
  }, []);

  // ── Save prediction to Firestore ───────────────────────────────────────────
  const predict = useCallback(
    async (matchId: string, winner: string) => {
      if (!user) throw new Error("Must be logged in to predict");
      await savePrediction(user.uid, matchId, winner);
    },
    [user],
  );

  // ── Remove prediction from Firestore ──────────────────────────────────────
  const removePredict = useCallback(
    async (matchId: string) => {
      if (!user) throw new Error("Must be logged in to predict");
      await deletePrediction(user.uid, matchId);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        predictions,
        loading,
        signIn,
        signOut,
        predict,
        removePredict,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
