"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { subscribeToLeaderboard, FirestoreUser } from "@/lib/firestore";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy, Info, Eye } from "lucide-react";
import { LeaderboardEntry } from "@/types";
import { cn } from "@/lib/utils";
import { SEEDED_R16_PREDICTIONS } from "@/data/seeded-predictions";
import { R16_MATCHES } from "@/data/matches";
import { PLAYERS } from "@/data/players";

type StageFilter = "all" | "group" | "r32" | "r16" | "qf" | "sf" | "final";

const STAGE_TABS: { key: StageFilter; label: string }[] = [
  { key: "all", label: "Overall" },
  { key: "group", label: "Group" },
  { key: "r32", label: "R32" },
  { key: "r16", label: "R16" },
  { key: "qf", label: "QF" },
  { key: "sf", label: "Semi" },
  { key: "final", label: "Final" },
];

function stagePoints(entry: LeaderboardEntry, stage: StageFilter): number {
  switch (stage) {
    case "group":
      return entry.groupPoints;
    case "r32":
      return entry.r32Points;
    case "r16":
      return entry.r16Points;
    case "qf":
      return entry.qfPoints;
    case "sf":
      return entry.sfPoints;
    case "final":
      return entry.finalPoints;
    default:
      return entry.totalPoints;
  }
}

function toLeaderboardEntries(users: FirestoreUser[]): LeaderboardEntry[] {
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

// ── Previously Picked helpers ─────────────────────────────────────────────────

/** Derive winner name from static match data (for FINISHED matches). */
function matchWinner(matchId: string): string | null {
  const m = R16_MATCHES.find((x) => x.id === matchId);
  if (!m || m.status !== "FINISHED") return null;
  if ((m.homeScore ?? 0) > (m.awayScore ?? 0)) return m.homeTeam.name;
  if ((m.awayScore ?? 0) > (m.homeScore ?? 0)) return m.awayTeam.name;
  // Penalties
  if ((m.homePenalties ?? 0) > (m.awayPenalties ?? 0)) return m.homeTeam.name;
  if ((m.awayPenalties ?? 0) > (m.homePenalties ?? 0)) return m.awayTeam.name;
  return null;
}

/** Show predictions for a match only once it's within 4 hours of kickoff. */
function isPickRevealed(matchDate: string): boolean {
  return Date.now() >= new Date(matchDate).getTime() - 4 * 60 * 60 * 1000;
}

/** Build player display name from PLAYERS data (id → firstName). */
function playerFirstName(playerId: string): string {
  const p = PLAYERS.find((x) => x.id === playerId);
  if (!p) return playerId;
  return p.name.split(" ")[0];
}

// ─────────────────────────────────────────────────────────────────────────────

const SCORE_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<StageFilter>("all");

  // Auto-trigger scoring when the leaderboard page loads.
  // Throttled to once per 5 min via localStorage so it doesn't spam.
  useEffect(() => {
    try {
      const last = parseInt(localStorage.getItem("last_score_ts") ?? "0", 10);
      if (Date.now() - last > SCORE_THROTTLE_MS) {
        localStorage.setItem("last_score_ts", String(Date.now()));
        fetch("/api/score-matches", { method: "POST" })
          .then((r) => r.json())
          .then((res) => console.log("[leaderboard] scored:", res))
          .catch((e) => console.warn("[leaderboard] score error:", e));
      }
    } catch {
      // localStorage blocked (private browsing, etc.) — ignore
    }
  }, []);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((u) => {
      setUsers(u);
      setLoaded(true);
    });
    return unsub;
  }, []);

  const allEntries = toLeaderboardEntries(users);

  // Re-rank entries by the selected stage's points
  const entries =
    stage === "all"
      ? allEntries
      : [...allEntries]
          .sort((a, b) => stagePoints(b, stage) - stagePoints(a, stage))
          .map((e, i) => ({ ...e, rank: i + 1 }));

  const userEntry = user ? entries.find((e) => e.id === user.uid) : null;

  if (!loaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-4xl trophy-float inline-block">🏆</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-5xl mb-2 trophy-float inline-block">🏆</div>
        <h1 className="font-display text-3xl font-black text-white mb-1">
          Leaderboard
        </h1>
        <p className="text-gray-400 text-sm">
          FIFA World Cup 2026 · Friends Edition · Live
        </p>
      </motion.div>

      {/* Podium */}
      {entries.length >= 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-end justify-center gap-4"
        >
          {/* 2nd */}
          <div className="text-center flex-1 max-w-[140px]">
            <div className="bg-gray-400/10 border border-gray-400/30 rounded-t-xl p-4 h-24 flex flex-col items-center justify-center">
              <span className="text-3xl">{entries[1].avatar}</span>
            </div>
            <div className="bg-gray-400/20 border border-gray-400/20 border-t-0 rounded-b-xl px-3 py-2">
              <p className="text-xs font-bold text-gray-300 truncate">
                {entries[1].name.split(" ")[0]}
              </p>
              <p className="font-display text-lg font-bold text-gray-300">
                {entries[1].totalPoints}
              </p>
            </div>
            <div className="text-2xl mt-1">🥈</div>
          </div>

          {/* 1st */}
          <div className="text-center flex-1 max-w-[160px]">
            <div className="bg-wc-gold/10 border border-wc-gold/40 rounded-t-xl p-4 h-32 flex flex-col items-center justify-center gold-glow">
              <span className="text-4xl">{entries[0].avatar}</span>
            </div>
            <div className="bg-wc-gold/20 border border-wc-gold/30 border-t-0 rounded-b-xl px-3 py-2">
              <p className="text-xs font-bold text-wc-gold truncate">
                {entries[0].name.split(" ")[0]}
              </p>
              <p className="font-display text-2xl font-bold text-wc-gold gold-glow-text">
                {entries[0].totalPoints}
              </p>
            </div>
            <div className="text-3xl mt-1">🥇</div>
          </div>

          {/* 3rd */}
          <div className="text-center flex-1 max-w-[140px]">
            <div className="bg-amber-600/10 border border-amber-600/30 rounded-t-xl p-4 h-20 flex flex-col items-center justify-center">
              <span className="text-3xl">{entries[2].avatar}</span>
            </div>
            <div className="bg-amber-600/20 border border-amber-600/20 border-t-0 rounded-b-xl px-3 py-2">
              <p className="text-xs font-bold text-amber-600 truncate">
                {entries[2].name.split(" ")[0]}
              </p>
              <p className="font-display text-lg font-bold text-amber-600">
                {entries[2].totalPoints}
              </p>
            </div>
            <div className="text-2xl mt-1">🥉</div>
          </div>
        </motion.div>
      )}

      {/* Stage filter + Full table */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-white flex items-center gap-2">
            <Trophy size={16} className="text-wc-gold" /> Rankings
          </h2>
          <span className="text-xs text-gray-500">
            {entries.length} players · live
          </span>
        </div>

        {/* Stage tabs */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {STAGE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStage(tab.key)}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-lg transition-all border",
                stage === tab.key
                  ? "bg-wc-gold text-wc-navy border-wc-gold"
                  : "bg-white/5 text-gray-400 border-white/10 hover:border-white/30 hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {stage !== "all" && (
          <p className="text-xs text-gray-500 mb-3 italic">
            Ranked by {STAGE_TABS.find((t) => t.key === stage)?.label} stage
            points
          </p>
        )}

        {/* Stage not started yet */}
        {stage !== "all" &&
        allEntries.every((e) => stagePoints(e, stage) === 0) ? (
          <div className="py-10 flex flex-col items-center gap-3 text-center">
            <span className="text-4xl">🔒</span>
            <p className="font-display font-bold text-white text-lg">
              Predictions Has Not Started
            </p>
            <p className="text-gray-500 text-sm">
              No {STAGE_TABS.find((t) => t.key === stage)?.label} matches have
              been played yet. Check back when the stage begins!
            </p>
          </div>
        ) : (
          <LeaderboardTable
            entries={entries}
            highlightId={userEntry?.id}
            stage={stage}
          />
        )}
      </div>

      {/* Points breakdown table */}
      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-white mb-3">
          Points Breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-white/10">
                <th className="text-left pb-2 font-medium">Player</th>
                {[
                  { key: "group" as StageFilter, label: "Group" },
                  { key: "r32" as StageFilter, label: "R32" },
                  { key: "r16" as StageFilter, label: "R16" },
                  { key: "qf" as StageFilter, label: "QF" },
                  { key: "sf" as StageFilter, label: "SF" },
                  { key: "final" as StageFilter, label: "Final" },
                ].map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "text-center pb-2 font-medium cursor-pointer hover:text-white transition-colors",
                      stage === col.key ? "text-wc-gold" : "",
                    )}
                    onClick={() => setStage(col.key)}
                  >
                    {col.label}
                  </th>
                ))}
                <th
                  className={cn(
                    "text-right pb-2 font-medium cursor-pointer",
                    stage === "all"
                      ? "text-wc-gold"
                      : "text-gray-500 hover:text-white",
                  )}
                  onClick={() => setStage("all")}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allEntries.map((entry) => (
                <tr
                  key={entry.id}
                  className={entry.id === userEntry?.id ? "bg-wc-gold/5" : ""}
                >
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span>{entry.avatar}</span>
                      <span className="font-medium text-gray-300 truncate max-w-[120px]">
                        {entry.name.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  {(
                    [
                      "group",
                      "r32",
                      "r16",
                      "qf",
                      "sf",
                      "final",
                    ] as StageFilter[]
                  ).map((col) => (
                    <td
                      key={col}
                      className={cn(
                        "text-center py-2.5",
                        stage === col
                          ? "text-wc-gold font-bold"
                          : "text-gray-400",
                      )}
                    >
                      {stagePoints(entry, col) || "—"}
                    </td>
                  ))}
                  <td
                    className={cn(
                      "text-right py-2.5 font-display font-bold",
                      stage === "all" ? "text-wc-gold" : "text-gray-400",
                    )}
                  >
                    {entry.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Previously Picked ───────────────────────────────────────────────── */}
      {(() => {
        // Only show matches that are within 4 hours of kickoff (picks revealed)
        const revealedMatches = R16_MATCHES.filter((m) =>
          isPickRevealed(m.date),
        );
        if (revealedMatches.length === 0) return null;

        return (
          <div className="glass-card p-5">
            <h2 className="font-display font-bold text-white flex items-center gap-2 mb-1">
              <Eye size={16} className="text-wc-purple" /> R16 Previously Picked
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Picks revealed 4 h before kickoff · ✅ correct · ❌ wrong · —
              result pending
            </p>

            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-2 font-medium text-gray-500 w-24 pr-3">
                      Player
                    </th>
                    {revealedMatches.map((m) => {
                      const winner = matchWinner(m.id);
                      return (
                        <th
                          key={m.id}
                          className="text-center pb-2 font-medium text-gray-500 px-1 min-w-[64px]"
                        >
                          <div>{m.label}</div>
                          <div className="text-[10px] text-gray-600 font-normal">
                            {m.homeTeam.flag}v{m.awayTeam.flag}
                          </div>
                          {winner && (
                            <div className="text-[10px] text-wc-green font-bold mt-0.5">
                              {winner}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {SEEDED_R16_PREDICTIONS.map((playerData) => {
                    const player = PLAYERS.find(
                      (p) => p.id === playerData.playerId,
                    );
                    return (
                      <tr
                        key={playerData.playerId}
                        className={cn(
                          "hover:bg-white/3 transition-colors",
                          users.find(
                            (u) =>
                              user &&
                              u.uid === user.uid &&
                              (u as FirestoreUser & { playerId?: string })
                                .playerId === playerData.playerId,
                          )
                            ? "bg-wc-gold/5"
                            : "",
                        )}
                      >
                        <td className="py-2.5 pr-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-base">
                              {player?.avatar ?? "👤"}
                            </span>
                            <span className="font-medium text-gray-300">
                              {playerFirstName(playerData.playerId)}
                            </span>
                          </div>
                        </td>
                        {revealedMatches.map((m) => {
                          const pick = playerData.predictions.find(
                            (p) => p.matchId === m.id,
                          );
                          const winner = matchWinner(m.id);
                          const isCorrect = winner && pick?.winner === winner;
                          const isWrong =
                            winner && pick?.winner && pick.winner !== winner;

                          return (
                            <td key={m.id} className="text-center py-2.5 px-1">
                              {pick ? (
                                <span
                                  className={cn(
                                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold",
                                    isCorrect
                                      ? "bg-green-900/30 text-green-400"
                                      : isWrong
                                        ? "bg-red-900/30 text-red-400 line-through opacity-70"
                                        : "bg-white/5 text-gray-300",
                                  )}
                                >
                                  {isCorrect ? "✅ " : isWrong ? "❌ " : ""}
                                  {pick.winner.split(" ").slice(-1)[0]}
                                </span>
                              ) : (
                                <span className="text-gray-700">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Scoring rules */}
      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-white flex items-center gap-2 mb-3">
          <Info size={16} className="text-wc-blue" /> Scoring Rules
        </h2>
        <div className="grid grid-cols-1 gap-1.5 text-sm">
          {[
            { label: "Round of 32 correct winner", pts: 2 },
            { label: "Round of 16 correct winner", pts: 4 },
            { label: "Quarter-final correct winner", pts: 8 },
            { label: "Semi-final correct winner", pts: 16 },
            { label: "Final runner-up correct", pts: 16 },
            { label: "Champion bonus", pts: 20 },
            { label: "Third-place match", pts: 8 },
          ].map((rule) => (
            <div
              key={rule.label}
              className="flex justify-between items-center py-2 border-b border-white/5"
            >
              <span className="text-gray-400 text-xs">{rule.label}</span>
              <span className="font-display font-bold text-wc-gold text-sm">
                +{rule.pts}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
