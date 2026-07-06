"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Prediction } from "@/types";
import { generatePlayerId } from "@/lib/utils";

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  createdAt: string;
}

interface AppStore {
  // User
  user: UserProfile | null;
  setUser: (name: string, avatar: string) => void;
  clearUser: () => void;

  // Predictions
  predictions: Record<string, Prediction>;
  addPrediction: (matchId: string, winner: string) => void;
  removePrediction: (matchId: string) => void;

  // Points tracking
  earnedPoints: Record<string, number>; // matchId -> points
  addPoints: (matchId: string, points: number) => void;
  getTotalPoints: () => number;

  // UI state
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
}

const AVATARS = [
  "⚽",
  "🏆",
  "🥅",
  "🦁",
  "🐉",
  "🦅",
  "⚡",
  "🌟",
  "🔥",
  "💎",
  "👑",
  "🎯",
  "🌊",
  "🦊",
  "🐺",
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (name: string, avatar: string) => {
        const existing = get().user;
        set({
          user: {
            id: existing?.id || generatePlayerId(),
            name,
            avatar,
            createdAt: existing?.createdAt || new Date().toISOString(),
          },
          showOnboarding: false,
        });
      },
      clearUser: () => set({ user: null, predictions: {}, earnedPoints: {} }),

      predictions: {},
      addPrediction: (matchId: string, winner: string) => {
        set((state) => ({
          predictions: {
            ...state.predictions,
            [matchId]: {
              matchId,
              winner,
              submittedAt: new Date().toISOString(),
            },
          },
        }));
      },
      removePrediction: (matchId: string) => {
        set((state) => {
          const predictions = { ...state.predictions };
          delete predictions[matchId];
          return { predictions };
        });
      },

      earnedPoints: {},
      addPoints: (matchId: string, points: number) => {
        set((state) => ({
          earnedPoints: {
            ...state.earnedPoints,
            [matchId]: points,
          },
        }));
      },
      getTotalPoints: () => {
        const { earnedPoints } = get();
        return Object.values(earnedPoints).reduce((sum, pts) => sum + pts, 0);
      },

      showOnboarding: true,
      setShowOnboarding: (show: boolean) => set({ showOnboarding: show }),
    }),
    {
      name: "wc2026-predict-store",
      version: 1,
    },
  ),
);

export { AVATARS };
