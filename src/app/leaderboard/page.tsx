"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  subscribeToLeaderboard,
  FirestoreUser,
  fetchPicksForMatches,
  subscribeToPicksForMatches,
} from "@/lib/firestore";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Trophy, Info, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { LeaderboardEntry, Match } from "@/types";
import { cn } from "@/lib/utils";
import { SEEDED_R16_PREDICTIONS } from "@/data/seeded-predictions";
import {
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";
import { PLAYERS } from "@/data/players";
import { useLiveMatches, LiveMatch } from "@/hooks/useLiveMatches";

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

/** Derive winner from static match data first, then fall back to live API. */
function getWinner(
  matchId: string,
  allMatches: Match[],
  allByApiId: Record<
    string,
    {
      status: string;
      homeTeam: string;
      awayTeam: string;
      homeScore: number;
      awayScore: number;
      homePenaltyScore: number | null;
      awayPenaltyScore: number | null;
    }
  >,
): string | null {
  // Static data (FINISHED)
  const m = allMatches.find((x) => x.id === matchId);
  if (m?.status === "FINISHED") {
    const h = m.homeScore ?? 0,
      a = m.awayScore ?? 0;
    const hp = m.homePenalties ?? 0,
      ap = m.awayPenalties ?? 0;
    if (h > a) return m.homeTeam.name;
    if (a > h) return m.awayTeam.name;
    if (hp > ap) return m.homeTeam.name;
    if (ap > hp) return m.awayTeam.name;
  }
  // Live API fallback
  const numId = matchId.match(/(\d+)$/)?.[1] ?? matchId;
  const api = allByApiId[numId];
  if (api?.status === "finished") {
    if (api.homePenaltyScore !== null && api.awayPenaltyScore !== null)
      return api.homePenaltyScore > api.awayPenaltyScore
        ? api.homeTeam
        : api.awayTeam;
    if (api.homeScore > api.awayScore) return api.homeTeam;
    if (api.awayScore > api.homeScore) return api.awayTeam;
  }
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

function apiResultTeams(match?: LiveMatch) {
  if (!match || match.status !== "finished") return null;
  const hasPenalties =
    match.homePenaltyScore != null && match.awayPenaltyScore != null;
  const homeWon = hasPenalties
    ? match.homePenaltyScore! > match.awayPenaltyScore!
    : match.homeScore > match.awayScore;
  const awayWon = hasPenalties
    ? match.awayPenaltyScore! > match.homePenaltyScore!
    : match.awayScore > match.homeScore;
  if (!homeWon && !awayWon) return null;

  const home = { name: match.homeTeam, flag: match.homeFlag };
  const away = { name: match.awayTeam, flag: match.awayFlag };
  return homeWon
    ? { winner: home, loser: away }
    : { winner: away, loser: home };
}

function resolveFinalMatchTeams(
  match: Match,
  allByApiId: Record<string, LiveMatch>,
) {
  const apiId = match.id.match(/(\d+)$/)?.[1] ?? match.id;
  const api = allByApiId[apiId];
  if (
    api?.homeTeam &&
    api.awayTeam &&
    api.homeTeam !== "undefined" &&
    api.awayTeam !== "undefined"
  ) {
    return {
      home: { name: api.homeTeam, flag: api.homeFlag },
      away: { name: api.awayTeam, flag: api.awayFlag },
    };
  }

  const sf1 = apiResultTeams(allByApiId["101"]);
  const sf2 = apiResultTeams(allByApiId["102"]);
  if (!sf1 || !sf2) {
    return {
      home: { name: match.homeTeam.name, flag: match.homeTeam.flag },
      away: { name: match.awayTeam.name, flag: match.awayTeam.flag },
    };
  }

  if (match.stage === "FINAL") {
    return { home: sf1.winner, away: sf2.winner };
  }
  if (match.stage === "THIRD") {
    return { home: sf1.loser, away: sf2.loser };
  }

  return {
    home: { name: match.homeTeam.name, flag: match.homeTeam.flag },
    away: { name: match.awayTeam.name, flag: match.awayTeam.flag },
  };
}

type SortCol = "group" | "ko" | "r32" | "r16" | "qf" | "sf" | "final" | "total";

function getSortValue(entry: LeaderboardEntry, col: SortCol): number {
  switch (col) {
    case "group":
      return entry.groupPoints;
    case "ko":
      return entry.knockoutPoints;
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

// ─────────────────────────────────────────────────────────────────────────────

interface LivePickedTableProps {
  title: string;
  subtitle: string;
  match: Match;
  picks: Record<string, Record<string, string>>;
  users: FirestoreUser[];
  highlightUid?: string;
  allByApiId: Record<string, LiveMatch>;
  accentClass: string;
}

function LivePickedTable({
  title,
  subtitle,
  match,
  picks,
  users,
  highlightUid,
  allByApiId,
  accentClass,
}: LivePickedTableProps) {
  const teams = resolveFinalMatchTeams(match, allByApiId);
  const winner = getWinner(match.id, FINAL_MATCHES, allByApiId);
  const sortedUsers = [...users].sort(
    (a, b) =>
      b.totalPoints - a.totalPoints ||
      b.correctPredictions - a.correctPredictions,
  );
  const pickedCount = sortedUsers.filter((u) => {
    const playerId = (u as FirestoreUser & { playerId?: string }).playerId;
    return !!playerId && !!picks[match.id]?.[playerId];
  }).length;

  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-bold text-white flex items-center gap-2 mb-1">
            <Eye size={16} className={accentClass} /> {title}
          </h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-right text-xs text-gray-500 flex-shrink-0">
          <p className="font-bold text-gray-300">
            {teams.home.flag} {teams.home.name}
          </p>
          <p className="text-gray-600">vs</p>
          <p className="font-bold text-gray-300">
            {teams.away.flag} {teams.away.name}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full text-xs min-w-[420px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left pb-2 font-medium text-gray-500 pr-3">
                Player
              </th>
              <th className="text-center pb-2 font-medium text-gray-500 px-2">
                Pick
              </th>
              <th className="text-right pb-2 font-medium text-gray-500 pl-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedUsers.map((u) => {
              const playerId =
                (u as FirestoreUser & { playerId?: string }).playerId ?? u.uid;
              const pickedWinner = picks[match.id]?.[playerId] ?? null;
              const isMe = u.uid === highlightUid;
              const isCorrect = winner && pickedWinner === winner;
              const isWrong = winner && pickedWinner && pickedWinner !== winner;

              return (
                <tr
                  key={u.uid}
                  className={cn(
                    "transition-colors hover:bg-white/3",
                    isMe && "bg-wc-gold/5",
                  )}
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{u.avatar ?? "👤"}</span>
                      <span
                        className={cn(
                          "font-medium",
                          isMe ? "text-wc-gold" : "text-gray-300",
                        )}
                      >
                        {u.displayName.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-2.5 px-2">
                    {pickedWinner ? (
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-1 rounded font-semibold",
                          isCorrect
                            ? "bg-green-900/30 text-green-400"
                            : isWrong
                              ? "bg-red-900/30 text-red-400"
                              : "bg-white/5 text-gray-300",
                        )}
                      >
                        {pickedWinner}
                      </span>
                    ) : (
                      <span className="text-gray-600 text-[10px]">no pick</span>
                    )}
                  </td>
                  <td className="text-right py-2.5 pl-2">
                    {winner && pickedWinner ? (
                      <span
                        className={cn(
                          "font-bold",
                          isCorrect ? "text-green-400" : "text-red-400",
                        )}
                      >
                        {isCorrect ? "correct" : "wrong"}
                      </span>
                    ) : winner ? (
                      <span className="text-gray-600">missed</span>
                    ) : pickedWinner ? (
                      <span className="text-wc-gold">picked</span>
                    ) : (
                      <span className="text-gray-700">pending</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-gray-600 mt-3">
        {pickedCount}/{sortedUsers.length} players picked
      </p>
    </div>
  );
}

const SCORE_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState<StageFilter>("all");
  // Breakdown table sort
  const [sortCol, setSortCol] = useState<SortCol>("total");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  // QF picks fetched from Firestore (matchId → playerId → winner)
  const [qfPicks, setQfPicks] = useState<
    Record<string, Record<string, string>>
  >({});
  // SF picks fetched from Firestore (matchId → playerId → winner)
  const [sfPicks, setSfPicks] = useState<
    Record<string, Record<string, string>>
  >({});
  const [finalPicks, setFinalPicks] = useState<
    Record<string, Record<string, string>>
  >({});

  const { allByApiId } = useLiveMatches();

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

  // Fetch QF predictions for all users (predictions are now open)
  const fetchQfPicks = useCallback(async () => {
    if (QF_MATCHES.length === 0 || users.length === 0) return;
    const userList = users.map((u) => ({
      uid: u.uid,
      playerId: (u as FirestoreUser & { playerId?: string }).playerId ?? u.uid,
    }));
    const picks = await fetchPicksForMatches(
      userList,
      QF_MATCHES.map((m) => m.id),
    );
    setQfPicks(picks);
  }, [users]);

  useEffect(() => {
    fetchQfPicks();
  }, [fetchQfPicks]);

  // Fetch SF predictions for all users
  const fetchSfPicks = useCallback(async () => {
    if (SF_MATCHES.length === 0 || users.length === 0) return;
    const userList = users.map((u) => ({
      uid: u.uid,
      playerId: (u as FirestoreUser & { playerId?: string }).playerId ?? u.uid,
    }));
    const picks = await fetchPicksForMatches(
      userList,
      SF_MATCHES.map((m) => m.id),
    );
    setSfPicks(picks);
  }, [users]);

  useEffect(() => {
    fetchSfPicks();
  }, [fetchSfPicks]);

  useEffect(() => {
    if (users.length === 0) return;
    const userList = users.map((u) => ({
      uid: u.uid,
      playerId: (u as FirestoreUser & { playerId?: string }).playerId ?? u.uid,
    }));
    return subscribeToPicksForMatches(
      userList,
      FINAL_MATCHES.map((m) => m.id),
      setFinalPicks,
    );
  }, [users]);

  const allEntries = toLeaderboardEntries(users);

  // Re-rank entries by the selected stage's points
  const entries =
    stage === "all"
      ? allEntries
      : [...allEntries]
          .sort((a, b) => stagePoints(b, stage) - stagePoints(a, stage))
          .map((e, i) => ({ ...e, rank: i + 1 }));

  const userEntry = user ? entries.find((e) => e.id === user.uid) : null;

  // Breakdown table: independently sortable
  const sortedBreakdown = [...allEntries].sort((a, b) => {
    const diff = getSortValue(a, sortCol) - getSortValue(b, sortCol);
    return sortDir === "desc" ? -diff : diff;
  });
  const thirdPlaceMatch = FINAL_MATCHES.find((m) => m.stage === "THIRD");
  const finalMatch = FINAL_MATCHES.find((m) => m.stage === "FINAL");

  function handleSortCol(col: SortCol) {
    if (col === sortCol) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortCol }) {
    if (col !== sortCol) return <span className="opacity-20 ml-0.5">↕</span>;
    return sortDir === "desc" ? (
      <ChevronDown size={12} className="inline ml-0.5 text-wc-gold" />
    ) : (
      <ChevronUp size={12} className="inline ml-0.5 text-wc-gold" />
    );
  }

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

      {/* Points breakdown table — sortable */}
      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-white mb-1">
          Points Breakdown
        </h2>
        <p className="text-xs text-gray-500 mb-3">
          Click any column header to sort ↑↓
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs border-b border-white/10">
                <th className="text-left pb-2 font-medium">Player</th>
                {(
                  [
                    { col: "group" as SortCol, label: "Group" },
                    { col: "ko" as SortCol, label: "KO" },
                    { col: "r32" as SortCol, label: "R32" },
                    { col: "r16" as SortCol, label: "R16" },
                    { col: "qf" as SortCol, label: "QF" },
                    { col: "sf" as SortCol, label: "SF" },
                    { col: "final" as SortCol, label: "Final" },
                    { col: "total" as SortCol, label: "Total" },
                  ] as { col: SortCol; label: string }[]
                ).map(({ col, label }) => (
                  <th
                    key={col}
                    onClick={() => handleSortCol(col)}
                    className={cn(
                      "text-center pb-2 font-medium cursor-pointer select-none transition-colors hover:text-white whitespace-nowrap",
                      sortCol === col ? "text-wc-gold" : "",
                      col === "total" ? "text-right" : "",
                    )}
                  >
                    {label}
                    <SortIcon col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedBreakdown.map((entry) => (
                <tr
                  key={entry.id}
                  className={entry.id === userEntry?.id ? "bg-wc-gold/5" : ""}
                >
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span>{entry.avatar}</span>
                      <span className="font-medium text-gray-300 truncate max-w-[100px]">
                        {entry.name.split(" ")[0]}
                      </span>
                    </div>
                  </td>
                  {(
                    [
                      { col: "group" as SortCol, val: entry.groupPoints },
                      { col: "ko" as SortCol, val: entry.knockoutPoints },
                      { col: "r32" as SortCol, val: entry.r32Points },
                      { col: "r16" as SortCol, val: entry.r16Points },
                      { col: "qf" as SortCol, val: entry.qfPoints },
                      { col: "sf" as SortCol, val: entry.sfPoints },
                      { col: "final" as SortCol, val: entry.finalPoints },
                    ] as { col: SortCol; val: number }[]
                  ).map(({ col, val }) => (
                    <td
                      key={col}
                      className={cn(
                        "text-center py-2.5 tabular-nums",
                        sortCol === col
                          ? "text-wc-gold font-bold"
                          : "text-gray-400",
                        col === "ko" ? "font-semibold text-blue-300" : "",
                        sortCol === col && col === "ko" ? "text-wc-gold" : "",
                      )}
                    >
                      {val || "—"}
                    </td>
                  ))}
                  <td
                    className={cn(
                      "text-right py-2.5 font-display font-bold tabular-nums",
                      sortCol === "total" ? "text-wc-gold" : "text-gray-300",
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

      {/* ── R16 Previously Picked (always open — all matches done) ─────────── */}
      {thirdPlaceMatch && (
        <LivePickedTable
          title='Picked "Rank 3"'
          subtitle="Live picks for the third-place match"
          match={thirdPlaceMatch}
          picks={finalPicks}
          users={users}
          highlightUid={user?.uid}
          allByApiId={allByApiId}
          accentClass="text-amber-500"
        />
      )}

      {finalMatch && (
        <LivePickedTable
          title='Picked "Final" Teams'
          subtitle="Live champion picks for the World Cup Final"
          match={finalMatch}
          picks={finalPicks}
          users={users}
          highlightUid={user?.uid}
          allByApiId={allByApiId}
          accentClass="text-yellow-300"
        />
      )}

      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-white flex items-center gap-2 mb-1">
          <Eye size={16} className="text-wc-purple" /> R16 Previously Picked
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          All R16 matches finished · ✅ correct · ❌ wrong
        </p>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs min-w-[540px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-2 font-medium text-gray-500 w-24 pr-3">
                  Player
                </th>
                {R16_MATCHES.map((m) => {
                  const winner = getWinner(m.id, R16_MATCHES, allByApiId);
                  return (
                    <th
                      key={m.id}
                      className="text-center pb-2 font-medium text-gray-500 px-1 min-w-[60px]"
                    >
                      <div className="font-bold text-gray-400">{m.label}</div>
                      <div className="text-[10px] text-gray-600 font-normal">
                        {m.homeTeam.flag}v{m.awayTeam.flag}
                      </div>
                      {winner ? (
                        <div className="text-[10px] text-green-400 font-bold mt-0.5">
                          {winner}
                        </div>
                      ) : (
                        <div className="text-[10px] text-gray-600 mt-0.5">
                          TBD
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
                const isMe = users.some(
                  (u) =>
                    user &&
                    u.uid === user.uid &&
                    (u as FirestoreUser & { playerId?: string }).playerId ===
                      playerData.playerId,
                );
                return (
                  <tr
                    key={playerData.playerId}
                    className={cn(
                      "transition-colors hover:bg-white/3",
                      isMe && "bg-wc-gold/5",
                    )}
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">
                          {player?.avatar ?? "👤"}
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isMe ? "text-wc-gold" : "text-gray-300",
                          )}
                        >
                          {playerFirstName(playerData.playerId)}
                        </span>
                      </div>
                    </td>
                    {R16_MATCHES.map((m) => {
                      const pick = playerData.predictions.find(
                        (p) => p.matchId === m.id,
                      );
                      const winner = getWinner(m.id, R16_MATCHES, allByApiId);
                      const revealed = isPickRevealed(m.date);
                      const isCorrect =
                        revealed && winner && pick?.winner === winner;
                      const isWrong =
                        revealed &&
                        winner &&
                        pick?.winner &&
                        pick.winner !== winner;
                      return (
                        <td key={m.id} className="text-center py-2 px-1">
                          {revealed && pick ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold",
                                isCorrect
                                  ? "bg-green-900/30 text-green-400"
                                  : isWrong
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-white/5 text-gray-300",
                              )}
                            >
                              {isCorrect ? "✅ " : isWrong ? "❌ " : ""}
                              {pick.winner.split(" ").slice(-1)[0]}
                            </span>
                          ) : revealed ? (
                            <span className="text-gray-700">—</span>
                          ) : (
                            <span className="text-[10px] text-gray-700">
                              🔒
                            </span>
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

      {/* ── QF Previously Picked (blurred until 4h before each match) ──────── */}
      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-white flex items-center gap-2 mb-1">
          <Eye size={16} className="text-wc-gold" /> QF Previously Picked
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          All QF picks revealed · ✅ correct · ❌ wrong
        </p>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs min-w-[440px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-2 font-medium text-gray-500 w-24 pr-3">
                  Player
                </th>
                {QF_MATCHES.map((m) => {
                  const winner = getWinner(m.id, QF_MATCHES, allByApiId);
                  return (
                    <th
                      key={m.id}
                      className="text-center pb-2 font-medium text-gray-500 px-1 min-w-[72px]"
                    >
                      <div className="font-bold text-gray-400">{m.label}</div>
                      <div className="text-[10px] text-gray-600 font-normal">
                        {`${m.homeTeam.flag}v${m.awayTeam.flag}`}
                      </div>
                      {winner && (
                        <div className="text-[10px] text-green-400 font-bold mt-0.5">
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
                const playerId = playerData.playerId;
                const isMe = users.some(
                  (u) =>
                    user &&
                    u.uid === user.uid &&
                    (u as FirestoreUser & { playerId?: string }).playerId ===
                      playerId,
                );
                return (
                  <tr
                    key={playerId}
                    className={cn(
                      "transition-colors hover:bg-white/3",
                      isMe && "bg-wc-gold/5",
                    )}
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">
                          {player?.avatar ?? "👤"}
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isMe ? "text-wc-gold" : "text-gray-300",
                          )}
                        >
                          {playerFirstName(playerId)}
                        </span>
                      </div>
                    </td>
                    {QF_MATCHES.map((m) => {
                      const pickedWinner = qfPicks[m.id]?.[playerId] ?? null;
                      const matchWin = getWinner(m.id, QF_MATCHES, allByApiId);
                      const isCorrect = matchWin && pickedWinner === matchWin;
                      const isWrong =
                        matchWin && pickedWinner && pickedWinner !== matchWin;
                      return (
                        <td key={m.id} className="text-center py-2 px-1">
                          {pickedWinner ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold",
                                isCorrect
                                  ? "bg-green-900/30 text-green-400"
                                  : isWrong
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-white/5 text-gray-300",
                              )}
                            >
                              {isCorrect ? "✅ " : isWrong ? "❌ " : ""}
                              {pickedWinner.split(" ").slice(-1)[0]}
                            </span>
                          ) : (
                            <span className="text-gray-600 text-[10px]">
                              no pick
                            </span>
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

      {/* ── SF Previously Picked (revealed) ───────────────────────────────── */}
      <div className="glass-card p-5">
        <h2 className="font-display font-bold text-white flex items-center gap-2 mb-1">
          <Eye size={16} className="text-purple-400" /> SF Previously Picked
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          All SF picks revealed · ✅ correct · ❌ wrong
        </p>
        <div className="overflow-x-auto -mx-1 px-1">
          <table className="w-full text-xs min-w-[320px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-2 font-medium text-gray-500 w-24 pr-3">
                  Player
                </th>
                {SF_MATCHES.map((m) => {
                  const winner = getWinner(m.id, SF_MATCHES, allByApiId);
                  return (
                    <th
                      key={m.id}
                      className="text-center pb-2 font-medium text-gray-500 px-1 min-w-[72px]"
                    >
                      <div className="font-bold text-gray-400">{m.label}</div>
                      <div className="text-[10px] text-gray-600 font-normal">
                        {`${m.homeTeam.flag}v${m.awayTeam.flag}`}
                      </div>
                      {winner && (
                        <div className="text-[10px] text-green-400 font-bold mt-0.5">
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
                const playerId = playerData.playerId;
                const isMe = users.some(
                  (u) =>
                    user &&
                    u.uid === user.uid &&
                    (u as FirestoreUser & { playerId?: string }).playerId ===
                      playerId,
                );
                return (
                  <tr
                    key={playerId}
                    className={cn(
                      "transition-colors hover:bg-white/3",
                      isMe && "bg-wc-gold/5",
                    )}
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">
                          {player?.avatar ?? "👤"}
                        </span>
                        <span
                          className={cn(
                            "font-medium",
                            isMe ? "text-wc-gold" : "text-gray-300",
                          )}
                        >
                          {playerFirstName(playerId)}
                        </span>
                      </div>
                    </td>
                    {SF_MATCHES.map((m) => {
                      const pickedWinner = sfPicks[m.id]?.[playerId] ?? null;
                      const matchWin = getWinner(m.id, SF_MATCHES, allByApiId);
                      const isCorrect = matchWin && pickedWinner === matchWin;
                      const isWrong =
                        matchWin && pickedWinner && pickedWinner !== matchWin;
                      return (
                        <td key={m.id} className="text-center py-2 px-1">
                          {pickedWinner ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded font-semibold",
                                isCorrect
                                  ? "bg-green-900/30 text-green-400"
                                  : isWrong
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-white/5 text-gray-300",
                              )}
                            >
                              {isCorrect ? "✅ " : isWrong ? "❌ " : ""}
                              {pickedWinner.split(" ").slice(-1)[0]}
                            </span>
                          ) : (
                            <span className="text-gray-600 text-[10px]">
                              no pick
                            </span>
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
