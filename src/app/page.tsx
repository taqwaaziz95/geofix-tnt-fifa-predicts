"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { subscribeToLeaderboard, FirestoreUser } from "@/lib/firestore";
import { R16_MATCHES, QF_MATCHES } from "@/data/matches";
import LeaderboardTable from "@/components/LeaderboardTable";
import MatchCard from "@/components/MatchCard";
import PredictionModal from "@/components/PredictionModal";
import { Match } from "@/types";
import { Trophy, Zap, Target, ChevronRight, LogIn, Lock } from "lucide-react";
import Link from "next/link";
import { cn, isMatchLockedByTime } from "@/lib/utils";
import LiveMatchBanner from "@/components/LiveMatchBanner";
import { ResultsList } from "@/components/ApiResultCard";
import { useLiveMatches, LiveMatch } from "@/hooks/useLiveMatches";

// QF prediction deadline: July 9 2026 18:00 WIB (= 11:00 UTC)
const QF_LOCK_DATE = new Date("2026-07-09T11:00:00Z");
function isQfLocked(): boolean {
  return Date.now() >= QF_LOCK_DATE.getTime();
}

function numericId(staticId: string): string {
  return staticId.replace(/^[^-]+-m/, "");
}

function mergeQfMatchData(
  staticMatches: Match[],
  apiMatches: LiveMatch[],
): Match[] {
  return staticMatches.map((sm) => {
    const api = apiMatches.find((a) => a.id === numericId(sm.id));
    if (!api) return sm;
    const homeTeam =
      api.homeTeam && api.homeTeam !== "undefined"
        ? { ...sm.homeTeam, name: api.homeTeam, flag: api.homeFlag }
        : sm.homeTeam;
    const awayTeam =
      api.awayTeam && api.awayTeam !== "undefined"
        ? { ...sm.awayTeam, name: api.awayTeam, flag: api.awayFlag }
        : sm.awayTeam;
    const base = { ...sm, homeTeam, awayTeam };
    if (api.status !== "finished") return base;
    return {
      ...base,
      status: "FINISHED" as const,
      homeScore: api.homeScore,
      awayScore: api.awayScore,
      homePenalties: api.homePenaltyScore ?? undefined,
      awayPenalties: api.awayPenaltyScore ?? undefined,
      homeScorers: api.homeScorers,
      awayScorers: api.awayScorers,
    };
  });
}

function firestoreUsersToLeaderboard(users: FirestoreUser[]) {
  return [...users]
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints ||
        b.correctPredictions - a.correctPredictions,
    )
    .map((u, i) => ({
      id: u.uid,
      name: u.displayName,
      avatar: u.avatar,
      groupPoints: u.groupPoints,
      knockoutPoints: u.knockoutPoints,
      totalPoints: u.totalPoints,
      correctPredictions: u.correctPredictions,
      r32Points: u.r32Points,
      r16Points: u.r16Points,
      qfPoints: u.qfPoints,
      sfPoints: u.sfPoints,
      finalPoints: u.finalPoints,
      rank: i + 1,
    }));
}

export default function HomePage() {
  const { user, profile, predictions, loading } = useAuth();
  const [lbUsers, setLbUsers] = useState<FirestoreUser[]>([]);
  const [activeModal, setActiveModal] = useState<Match | null>(null);
  const [lbLoaded, setLbLoaded] = useState(false);
  const {
    recentR16,
    r32Results,
    r16AllFinished,
    qfMatches: apiQfMatches,
  } = useLiveMatches();

  // Real-time leaderboard from Firestore
  useEffect(() => {
    const unsub = subscribeToLeaderboard((users) => {
      setLbUsers(users);
      setLbLoaded(true);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-4xl trophy-float inline-block">⚽</div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not logged in → show public landing
  if (!user || !profile) {
    const leaderboard = firestoreUsersToLeaderboard(lbUsers);
    const top5 = leaderboard.slice(0, 5);

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-mesh flex flex-col items-center justify-center px-4 py-12">
        {/* Live match banner — visible to everyone */}
        <div className="w-full max-w-2xl mb-6">
          <LiveMatchBanner />
        </div>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-6xl mb-4 trophy-float inline-block">🏆</div>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3">
            FIFA World Cup
            <span className="block text-wc-gold gold-glow-text">
              2026 Predictions
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Friends edition · Pick your winners · Earn points · Claim glory
          </p>
          <div className="flex items-center justify-center gap-6 mt-5">
            {[
              { val: lbUsers.length || "...", label: "Players" },
              {
                val: R16_MATCHES.filter((m) => m.status === "SCHEDULED").length,
                label: "Matches Left",
              },
              { val: lbUsers[0]?.totalPoints || "...", label: "Top Score" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-bold text-wc-gold">
                  {s.val}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 mt-6 bg-wc-gold text-wc-navy font-display font-bold px-8 py-3.5 rounded-xl hover:bg-wc-gold-light transition-colors text-base"
          >
            <LogIn size={18} /> Sign In to Predict
          </Link>
        </motion.div>

        {/* Public leaderboard preview */}
        {lbLoaded && top5.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5 max-w-md w-full"
          >
            <h3 className="font-display font-bold text-sm text-gray-400 mb-3 flex items-center gap-2">
              <Trophy size={14} className="text-wc-gold" /> Live Leaderboard
            </h3>
            <LeaderboardTable entries={top5} compact />
            <Link
              href="/leaderboard"
              className="block text-center text-xs text-wc-gold/70 hover:text-wc-gold mt-3 transition-colors"
            >
              View full leaderboard →
            </Link>
          </motion.div>
        )}
      </div>
    );
  }

  // ── Logged in dashboard ──────────────────────────────────────────────────
  const leaderboard = firestoreUsersToLeaderboard(lbUsers);
  const top5 = leaderboard.slice(0, 5);
  const userEntry = leaderboard.find((e) => e.id === user.uid);

  // QF matches with resolved team names + scores
  const qfMerged = mergeQfMatchData(QF_MATCHES, apiQfMatches);
  const qfUnpredicted = qfMerged.filter((m) => !predictions[m.id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Live match banner */}
      <LiveMatchBanner />

      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{profile.avatar}</span>
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h2 className="font-display text-xl font-bold text-white">
              {profile.displayName}
            </h2>
            <p className="text-xs text-gray-500">@{profile.username}</p>
          </div>
        </div>
        {userEntry && (
          <div className="flex items-center gap-5">
            <div className="text-center hidden sm:block">
              <p className="font-display text-2xl font-bold text-wc-gold">
                {userEntry.totalPoints}
              </p>
              <p className="text-xs text-gray-500">pts</p>
            </div>
            <div className="text-center hidden sm:block">
              <p className="font-display text-2xl font-bold text-white">
                #{userEntry.rank}
              </p>
              <p className="text-xs text-gray-500">rank</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "QF Predicted",
            value: `${qfMerged.filter((m) => predictions[m.id]).length}/${qfMerged.length}`,
            icon: Target,
            color: "text-wc-blue",
          },
          {
            label: "QF Matches",
            value: qfMerged.length,
            icon: Zap,
            color: "text-wc-gold",
          },
          {
            label: "Your Rank",
            value: userEntry ? `#${userEntry.rank}` : "N/A",
            icon: Trophy,
            color: "text-wc-green",
          },
          {
            label: "Leader",
            value: leaderboard[0]?.name.split(" ")[0] || "—",
            icon: Trophy,
            color: "text-yellow-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="glass-card p-4"
          >
            <stat.icon size={16} className={cn(stat.color, "mb-2")} />
            <p className={cn("font-display text-xl font-bold", stat.color)}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          {/* ── QF Quick Predict (Latest Upcoming) ── */}
          {r16AllFinished && qfUnpredicted.length > 0 && !isQfLocked() && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  🏆 Quick Predict — Quarter-Finals
                </h2>
                <Link
                  href="/predict"
                  className="text-xs text-wc-gold hover:text-wc-gold-light flex items-center gap-1 transition-colors"
                >
                  View all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-2">
                <Lock size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">
                  Deadline: <strong>Jul 9 · 18:00 WIB</strong> — predict now!
                </p>
              </div>
              {qfUnpredicted.map((match, i) => {
                const locked = isMatchLockedByTime(match.date);
                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    onPredict={locked ? undefined : setActiveModal}
                    index={i}
                  />
                );
              })}
            </div>
          )}

          {/* QF already predicted — show summary */}
          {r16AllFinished && qfUnpredicted.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  🏆 Quarter-Finals
                </h2>
                <Link
                  href="/predict"
                  className="text-xs text-wc-gold hover:text-wc-gold-light flex items-center gap-1 transition-colors"
                >
                  View picks <ChevronRight size={12} />
                </Link>
              </div>
              {qfMerged.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={
                    predictions[match.id]
                      ? {
                          matchId: match.id,
                          winner: predictions[match.id].winner,
                          submittedAt: "",
                        }
                      : undefined
                  }
                  index={i}
                />
              ))}
            </div>
          )}

          {/* ── QF Results (show finished matches like R16/R32 results) ── */}
          {apiQfMatches.filter((m) => m.status === "finished").length > 0 && (
            <ResultsList
              matches={[...apiQfMatches.filter((m) => m.status === "finished")].sort(
                (a, b) => b.localDate.localeCompare(a.localDate),
              )}
              title="QF Results"
              icon="🏆"
              initialShow={4}
            />
          )}

          {/* ── R16 Results ── */}
          {recentR16.length > 0 && (
            <ResultsList
              matches={recentR16}
              title="R16 Results"
              icon="✅"
              initialShow={5}
            />
          )}

          {r32Results.length > 0 && (
            <ResultsList
              matches={r32Results}
              title="R32 Results"
              icon="📋"
              initialShow={5}
            />
          )}
        </div>

        {/* Leaderboard sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Trophy size={16} className="text-wc-gold" /> Leaderboard
            </h2>
            <Link
              href="/leaderboard"
              className="text-xs text-wc-gold hover:text-wc-gold-light flex items-center gap-1 transition-colors"
            >
              Full <ChevronRight size={12} />
            </Link>
          </div>
          <div className="glass-card p-4">
            <LeaderboardTable entries={top5} highlightId={user.uid} compact />
          </div>
        </div>
      </div>

      {activeModal && (
        <PredictionModal
          match={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
