"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { subscribeToLeaderboard, FirestoreUser } from "@/lib/firestore";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy, Info } from "lucide-react";
import { LeaderboardEntry } from "@/types";

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

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((u) => {
      setUsers(u);
      setLoaded(true);
    });
    return unsub;
  }, []);

  const entries = toLeaderboardEntries(users);
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

      {/* Full table */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-white flex items-center gap-2">
            <Trophy size={16} className="text-wc-gold" /> Full Rankings
          </h2>
          <span className="text-xs text-gray-500">
            {entries.length} players · live
          </span>
        </div>
        <LeaderboardTable entries={entries} highlightId={userEntry?.id} />
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
                <th className="text-center pb-2 font-medium">Group</th>
                <th className="text-center pb-2 font-medium">R32</th>
                <th className="text-center pb-2 font-medium">R16</th>
                <th className="text-center pb-2 font-medium">QF</th>
                <th className="text-right pb-2 font-medium text-wc-gold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry) => (
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
                  <td className="text-center py-2.5 text-gray-400">
                    {entry.groupPoints || "—"}
                  </td>
                  <td className="text-center py-2.5 text-gray-400">
                    {entry.r32Points || "—"}
                  </td>
                  <td className="text-center py-2.5 text-gray-400">
                    {entry.r16Points || "—"}
                  </td>
                  <td className="text-center py-2.5 text-gray-400">
                    {entry.qfPoints || "—"}
                  </td>
                  <td className="text-right py-2.5 font-display font-bold text-wc-gold">
                    {entry.totalPoints}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
