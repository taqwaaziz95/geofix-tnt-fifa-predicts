"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { R16_MATCHES } from "@/data/matches";
import {
  getSeededPredictionsForPlayer,
  isExistingLockedPlayer,
} from "@/data/seeded-predictions";
import MatchCard from "@/components/MatchCard";
import PredictionModal from "@/components/PredictionModal";
import { Match, Prediction } from "@/types";
import { Target, CheckCircle2, LogIn, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PredictPage() {
  const { user, profile, predictions, loading } = useAuth();
  const [activeModal, setActiveModal] = useState<Match | null>(null);

  // Determine if this user is an existing player with locked predictions
  const isLocked = useMemo(() => {
    if (!profile) return false;
    return isExistingLockedPlayer(profile.playerId ?? "");
  }, [profile]);

  // Get the seeded predictions for this existing player
  const seededPreds = useMemo(() => {
    if (!profile || !isLocked) return {};
    return getSeededPredictionsForPlayer(profile.playerId ?? "");
  }, [profile, isLocked]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-4xl trophy-float inline-block">⚽</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4 trophy-float inline-block">🔒</div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Sign in to Predict
        </h2>
        <p className="text-gray-400 mb-6">
          You need to be logged in to make predictions.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-wc-gold text-wc-navy font-display font-bold px-6 py-3 rounded-xl hover:bg-wc-gold-light transition-colors"
        >
          <LogIn size={18} /> Sign In
        </Link>
        <p className="text-gray-600 text-sm mt-4">
          Browse the{" "}
          <Link href="/leaderboard" className="text-wc-gold hover:underline">
            leaderboard
          </Link>{" "}
          or{" "}
          <Link href="/bracket" className="text-wc-gold hover:underline">
            bracket
          </Link>{" "}
          without signing in.
        </p>
      </div>
    );
  }

  const upcomingMatches = R16_MATCHES.filter((m) => m.status === "SCHEDULED");
  const finishedMatches = R16_MATCHES.filter((m) => m.status === "FINISHED");

  // For existing locked players, use seeded predictions
  // For new users, use their Firestore predictions
  const predictedCount = upcomingMatches.filter((m) =>
    isLocked ? seededPreds[m.id] : predictions[m.id],
  ).length;
  // const finishedPredCount = finishedMatches.filter((m) =>
  //   isLocked ? seededPreds[m.id] : predictions[m.id],
  // ).length;
  const totalCount = upcomingMatches.length;
  const progress =
    totalCount > 0 ? Math.round((predictedCount / totalCount) * 100) : 0;

  // Resolve a prediction: use seeded data for locked users, Firestore for new users
  function toPrediction(matchId: string): Prediction | undefined {
    if (isLocked && seededPreds[matchId]) {
      return {
        matchId,
        winner: seededPreds[matchId],
        submittedAt: "2026-07-05T23:59:00Z",
      };
    }
    const p = predictions[matchId];
    if (!p) return undefined;
    return { matchId, winner: p.winner, submittedAt: "" };
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
              <Target size={22} className="text-wc-gold" /> R16 Predictions
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Playing as{" "}
              <span className="text-wc-gold font-semibold">
                {profile.avatar} {profile.displayName}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "font-display text-2xl font-bold",
                predictedCount === totalCount
                  ? "text-wc-green"
                  : "text-wc-gold",
              )}
            >
              {predictedCount}/{totalCount}
            </p>
            <p className="text-xs text-gray-500">predicted</p>
          </div>
        </div>

        <div className="bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-2 rounded-full",
              progress === 100
                ? "bg-wc-green"
                : "bg-gradient-to-r from-wc-gold to-wc-gold-light",
            )}
          />
        </div>

        {predictedCount === totalCount && totalCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-wc-green text-sm font-medium mt-2 flex items-center gap-1"
          >
            <CheckCircle2 size={14} /> All predictions submitted — good luck!
          </motion.p>
        )}
      </motion.div>

      {/* Points guide */}
      <div className="glass-card p-4">
        <h3 className="font-display font-bold text-sm text-gray-400 mb-3">
          Points Guide
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { stage: "Round of 32", pts: 2, color: "text-gray-400" },
            { stage: "Round of 16", pts: 4, color: "text-wc-blue" },
            { stage: "Quarter-final", pts: 8, color: "text-wc-purple" },
            { stage: "Semi-final", pts: 16, color: "text-wc-gold" },
          ].map((item) => (
            <div
              key={item.stage}
              className="text-center bg-white/5 rounded-xl p-3"
            >
              <p className={cn("font-display text-xl font-bold", item.color)}>
                +{item.pts}
              </p>
              <p className="text-xs text-gray-500">{item.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming matches */}
      {upcomingMatches.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-4xl mb-3">✅</p>
          <h3 className="font-display text-lg font-bold text-white mb-1">
            R16 is complete!
          </h3>
          <p className="text-gray-400 text-sm">
            Check the bracket for Quarter-final matchups.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {isLocked ? (
            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">
              <Lock size={14} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                Your predictions were locked on Sunday, Jul 5. They cannot be
                edited.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">
              <Lock size={14} className="text-amber-400 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                Once you submit a prediction it is <strong>locked</strong> — you
                cannot change it. Choose wisely!
              </p>
            </div>
          )}
          {upcomingMatches.map((match, i) => {
            // A prediction is locked once submitted — no editing allowed
            const hasPrediction = isLocked
              ? !!seededPreds[match.id]
              : !!predictions[match.id];
            return (
              <MatchCard
                key={match.id}
                match={match}
                prediction={toPrediction(match.id)}
                onPredict={hasPrediction ? undefined : setActiveModal}
                index={i}
              />
            );
          })}
        </div>
      )}

      {/* Finished R16 */}
      {finishedMatches.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white">
            R16 Results
          </h2>
          {finishedMatches.map((match, i) => (
            <MatchCard
              key={match.id}
              match={match}
              prediction={toPrediction(match.id)}
              showPoints
              earnedPoints={4}
              index={i}
            />
          ))}
        </div>
      )}

      {activeModal && (
        <PredictionModal
          match={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
