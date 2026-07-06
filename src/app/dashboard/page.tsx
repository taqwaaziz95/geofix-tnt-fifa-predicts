"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { PLAYERS } from "@/data/players";
import {
  ALL_KNOCKOUT_MATCHES,
  R32_MATCHES,
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";
import { STADIUMS, TOTAL_STADIUM_CAPACITY } from "@/data/stadiums";
import { getConfederationStats, getContinentStats } from "@/data/tournament";
import { cn } from "@/lib/utils";
import {
  LogIn,
  Trophy,
  Users,
  Target,
  TrendingUp,
  MapPin,
  Globe2,
  BarChart3,
  Zap,
  Award,
  Flag,
} from "lucide-react";
import Link from "next/link";

// ─── Helper: compute stats dynamically ───────────────────────────────────────

function useDashboardStats() {
  return useMemo(() => {
    const players = [...PLAYERS].sort((a, b) => b.totalPoints - a.totalPoints);
    const totalPlayers = players.length;

    // Top scorer
    const topPlayer = players[0];

    // Average points
    const avgPoints = Math.round(
      players.reduce((s, p) => s + p.totalPoints, 0) / totalPlayers,
    );

    // Average completion (predictions made / total matches available)
    const totalFinished = ALL_KNOCKOUT_MATCHES.filter(
      (m) => m.status === "FINISHED",
    ).length;
    const totalPossiblePredictions = totalFinished * totalPlayers;
    const totalCorrectPredictions = players.reduce(
      (s, p) => s + p.correctPredictions,
      0,
    );
    const avgAccuracy =
      totalPossiblePredictions > 0
        ? Math.round(
            (totalCorrectPredictions / totalPossiblePredictions) * 100 * 10,
          ) / 10
        : 0;

    // Points by round
    const roundStats = [
      {
        label: "Group Stage",
        key: "groupPoints" as const,
        color: "bg-emerald-500",
      },
      { label: "Round of 32", key: "r32Points" as const, color: "bg-sky-500" },
      {
        label: "Round of 16",
        key: "r16Points" as const,
        color: "bg-violet-500",
      },
      {
        label: "Quarter-finals",
        key: "qfPoints" as const,
        color: "bg-amber-500",
      },
      { label: "Semi-finals", key: "sfPoints" as const, color: "bg-rose-500" },
      { label: "Final", key: "finalPoints" as const, color: "bg-yellow-400" },
    ];

    const avgByRound = roundStats.map((r) => ({
      ...r,
      avg: Math.round(players.reduce((s, p) => s + p[r.key], 0) / totalPlayers),
      max: Math.max(...players.map((p) => p[r.key])),
    }));

    // Match results stats
    const finishedKnockout = ALL_KNOCKOUT_MATCHES.filter(
      (m) => m.status === "FINISHED",
    );
    const scheduledKnockout = ALL_KNOCKOUT_MATCHES.filter(
      (m) => m.status === "SCHEDULED",
    );
    const totalGoals = finishedKnockout.reduce(
      (s, m) => s + (m.homeScore ?? 0) + (m.awayScore ?? 0),
      0,
    );
    const matchesWithET = finishedKnockout.filter((m) => m.extraTime).length;
    const matchesWithPens = finishedKnockout.filter(
      (m) => m.homePenalties != null,
    ).length;

    // Most selected champion / finalist - based on who has most total points (simulated)
    // In a real app this would come from Firebase predictions data
    // For now we derive "most popular pick" from player prediction patterns
    const mostSelectedChampion = "Mexico"; // From the spreadsheet data
    const mostSelectedFinalist = "Mexico";

    // Teams still in tournament
    const eliminatedInR32 = new Set<string>();
    R32_MATCHES.filter((m) => m.status === "FINISHED").forEach((m) => {
      if (m.homePenalties != null) {
        if (m.homePenalties < m.awayPenalties!)
          eliminatedInR32.add(m.homeTeam.name);
        else eliminatedInR32.add(m.awayTeam.name);
      } else if (m.homeScore! > m.awayScore!) {
        eliminatedInR32.add(m.awayTeam.name);
      } else {
        eliminatedInR32.add(m.homeTeam.name);
      }
    });

    const eliminatedInR16 = new Set<string>();
    R16_MATCHES.filter((m) => m.status === "FINISHED").forEach((m) => {
      if (m.homePenalties != null) {
        if (m.homePenalties < m.awayPenalties!)
          eliminatedInR16.add(m.homeTeam.name);
        else eliminatedInR16.add(m.awayTeam.name);
      } else if (m.homeScore! > m.awayScore!) {
        eliminatedInR16.add(m.awayTeam.name);
      } else {
        eliminatedInR16.add(m.homeTeam.name);
      }
    });

    const teamsStillIn = 48 - eliminatedInR32.size - eliminatedInR16.size;

    // Confederation stats
    const confedStats = getConfederationStats();
    const continentStats = getContinentStats();

    return {
      players,
      topPlayer,
      totalPlayers,
      avgPoints,
      avgAccuracy,
      avgByRound,
      finishedKnockout,
      scheduledKnockout,
      totalGoals,
      matchesWithET,
      matchesWithPens,
      mostSelectedChampion,
      mostSelectedFinalist,
      teamsStillIn,
      confedStats,
      continentStats,
    };
  }, []);
}

// ─── Components ──────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 flex items-center gap-4"
    >
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="font-display text-xl font-bold text-white truncate">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </motion.div>
  );
}

function HeroStatBanner({
  champion,
  finalist,
  topScore,
  accuracy,
}: {
  champion: string;
  finalist: string;
  topScore: number;
  accuracy: number;
}) {
  const items = [
    {
      label: "Most selected champion",
      value: champion,
      color: "from-green-900/40 to-green-900/10 border-green-600/30",
      textColor: "text-green-400",
    },
    {
      label: "Most selected finalist",
      value: finalist,
      color: "from-blue-900/40 to-blue-900/10 border-blue-600/30",
      textColor: "text-blue-400",
    },
    {
      label: "Top total score",
      value: topScore.toString(),
      color: "from-amber-900/40 to-amber-900/10 border-amber-600/30",
      textColor: "text-amber-400",
    },
    {
      label: "Average accuracy",
      value: `${accuracy}%`,
      color: "from-purple-900/40 to-purple-900/10 border-purple-600/30",
      textColor: "text-purple-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
    >
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            "rounded-2xl border p-4 bg-gradient-to-br text-center",
            item.color,
          )}
        >
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-1">
            {item.label}
          </p>
          <p
            className={cn(
              "font-display text-2xl lg:text-3xl font-bold",
              item.textColor,
            )}
          >
            {item.value}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

function BarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number; color: string }[];
  maxValue?: number;
}) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-400 w-24 text-right truncate">
            {item.label}
          </span>
          <div className="flex-1 bg-white/5 rounded-full h-5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: max > 0 ? `${(item.value / max) * 100}%` : "0%",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full flex items-center justify-end px-2",
                item.color,
              )}
            >
              {item.value > 0 && (
                <span className="text-[10px] font-bold text-white">
                  {item.value}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left text-xs text-gray-500 font-medium py-2 px-2"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-white/5 hover:bg-white/5 transition-colors"
            >
              {row.map((cell, j) => (
                <td key={j} className="py-2 px-2 text-gray-300 font-medium">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, profile, loading } = useAuth();
  const stats = useDashboardStats();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-4xl trophy-float inline-block">📊</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4 trophy-float inline-block">🔒</div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Sign in to view Dashboard
        </h2>
        <p className="text-gray-400 mb-6">
          Access tournament statistics, player analytics, and match insights.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-wc-gold text-wc-navy font-display font-bold px-6 py-3 rounded-xl hover:bg-wc-gold-light transition-colors"
        >
          <LogIn size={18} /> Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 mb-2"
      >
        <div className="p-2 bg-wc-gold/20 rounded-xl">
          <BarChart3 size={22} className="text-wc-gold" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Statistics Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Live summary of selections, scores, and round-by-round performance.
          </p>
        </div>
      </motion.div>

      {/* Hero Banner — like the spreadsheet top row */}
      <HeroStatBanner
        champion={stats.mostSelectedChampion}
        finalist={stats.mostSelectedFinalist}
        topScore={stats.topPlayer.totalPoints}
        accuracy={stats.avgAccuracy}
      />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Players"
          value={stats.totalPlayers}
          color="bg-sky-600/30"
          sub="competing"
        />
        <StatCard
          icon={Target}
          label="Matches Played"
          value={stats.finishedKnockout.length}
          color="bg-emerald-600/30"
          sub={`${stats.scheduledKnockout.length} remaining`}
        />
        <StatCard
          icon={Zap}
          label="Total Goals"
          value={stats.totalGoals}
          color="bg-amber-600/30"
          sub={`${(stats.totalGoals / Math.max(stats.finishedKnockout.length, 1)).toFixed(1)} per match`}
        />
        <StatCard
          icon={Globe2}
          label="Teams Remaining"
          value={stats.teamsStillIn}
          color="bg-violet-600/30"
          sub="of 48"
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Left Column ─── */}
        <div className="space-y-6">
          {/* Leaderboard Top 10 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-wc-gold" />
              <h2 className="font-display font-bold text-white">
                Top 10 Players
              </h2>
            </div>
            <MiniTable
              headers={["#", "Player", "Group", "KO", "Total", "Correct"]}
              rows={stats.players
                .slice(0, 10)
                .map((p, i) => [
                  i + 1,
                  `${p.avatar} ${p.name}`,
                  p.groupPoints,
                  p.knockoutPoints,
                  p.totalPoints,
                  p.correctPredictions,
                ])}
            />
          </motion.div>

          {/* Average points by round */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-wc-blue" />
              <h2 className="font-display font-bold text-white">
                Average Points by Round
              </h2>
            </div>
            <BarChart
              data={stats.avgByRound.map((r) => ({
                label: r.label,
                value: r.avg,
                color: r.color,
              }))}
            />
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-xs text-gray-500">
                Max points in a round:{" "}
                <span className="text-white font-bold">
                  {Math.max(...stats.avgByRound.map((r) => r.max))}
                </span>
              </p>
            </div>
          </motion.div>

          {/* Knockout drama stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-rose-400" />
              <h2 className="font-display font-bold text-white">
                Knockout Drama
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-display text-2xl font-bold text-white">
                  {stats.finishedKnockout.length}
                </p>
                <p className="text-[10px] text-gray-500 uppercase">Matches</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-display text-2xl font-bold text-amber-400">
                  {stats.matchesWithET}
                </p>
                <p className="text-[10px] text-gray-500 uppercase">
                  Extra Time
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <p className="font-display text-2xl font-bold text-rose-400">
                  {stats.matchesWithPens}
                </p>
                <p className="text-[10px] text-gray-500 uppercase">Penalties</p>
              </div>
            </div>
          </motion.div>

          {/* Points Distribution by Round — detailed per-player breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-violet-400" />
              <h2 className="font-display font-bold text-white">
                Points Distribution by Round
              </h2>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Breakdown of each player&apos;s knockout-stage points (R32: 2pts,
              R16: 4pts, QF: 8pts, SF: 16pts, Final: 20pts per correct
              prediction).
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-[11px] text-gray-500 font-medium py-2 px-2">
                      #
                    </th>
                    <th className="text-left text-[11px] text-gray-500 font-medium py-2 px-2">
                      Player
                    </th>
                    <th className="text-center text-[11px] text-gray-400 font-medium py-2 px-2 bg-sky-500/10 rounded-t">
                      R32
                    </th>
                    <th className="text-center text-[11px] text-gray-400 font-medium py-2 px-2 bg-violet-500/10 rounded-t">
                      R16
                    </th>
                    <th className="text-center text-[11px] text-gray-400 font-medium py-2 px-2 bg-amber-500/10 rounded-t">
                      QF
                    </th>
                    <th className="text-center text-[11px] text-gray-400 font-medium py-2 px-2 bg-rose-500/10 rounded-t">
                      SF
                    </th>
                    <th className="text-center text-[11px] text-gray-400 font-medium py-2 px-2 bg-yellow-500/10 rounded-t">
                      Final
                    </th>
                    <th className="text-center text-[11px] text-wc-gold font-bold py-2 px-2">
                      KO Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.players.map((p, i) => (
                    <tr
                      key={p.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-2 px-2 text-gray-500 font-medium">
                        {i + 1}
                      </td>
                      <td className="py-2 px-2 text-gray-200 font-medium whitespace-nowrap">
                        <span className="mr-1">{p.avatar}</span>
                        {p.name.split(" ").slice(0, 2).join(" ")}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={cn(
                            "font-display font-bold",
                            p.r32Points > 0 ? "text-sky-400" : "text-gray-600",
                          )}
                        >
                          {p.r32Points}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={cn(
                            "font-display font-bold",
                            p.r16Points > 0
                              ? "text-violet-400"
                              : "text-gray-600",
                          )}
                        >
                          {p.r16Points}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={cn(
                            "font-display font-bold",
                            p.qfPoints > 0 ? "text-amber-400" : "text-gray-600",
                          )}
                        >
                          {p.qfPoints}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={cn(
                            "font-display font-bold",
                            p.sfPoints > 0 ? "text-rose-400" : "text-gray-600",
                          )}
                        >
                          {p.sfPoints}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span
                          className={cn(
                            "font-display font-bold",
                            p.finalPoints > 0
                              ? "text-yellow-400"
                              : "text-gray-600",
                          )}
                        >
                          {p.finalPoints}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className="font-display font-bold text-wc-gold">
                          {p.knockoutPoints}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Point value legend */}
            <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-3">
              <span className="text-[10px] text-gray-500 uppercase font-medium">
                Points per correct pick:
              </span>
              <span className="text-[10px] text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full">
                R32 = 2 pts
              </span>
              <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-full">
                R16 = 4 pts
              </span>
              <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                QF = 8 pts
              </span>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">
                SF = 16 pts
              </span>
              <span className="text-[10px] text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-full">
                Final = 20 pts
              </span>
            </div>
          </motion.div>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-6">
          {/* Confederation Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Flag size={16} className="text-emerald-400" />
              <h2 className="font-display font-bold text-white">
                Teams by Confederation
              </h2>
            </div>
            <BarChart
              data={stats.confedStats.map((c) => ({
                label: c.name,
                value: c.count,
                color:
                  c.name === "UEFA"
                    ? "bg-blue-500"
                    : c.name === "CAF"
                      ? "bg-emerald-500"
                      : c.name === "CONMEBOL"
                        ? "bg-yellow-500"
                        : c.name === "CONCACAF"
                          ? "bg-red-500"
                          : c.name === "AFC"
                            ? "bg-orange-500"
                            : "bg-cyan-500",
              }))}
            />
          </motion.div>

          {/* Continent Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Globe2 size={16} className="text-sky-400" />
              <h2 className="font-display font-bold text-white">
                Teams by Continent
              </h2>
            </div>
            <BarChart
              data={stats.continentStats.map((c) => ({
                label: c.name,
                value: c.count,
                color:
                  c.name === "Europe"
                    ? "bg-blue-500"
                    : c.name === "Africa"
                      ? "bg-emerald-500"
                      : c.name === "South America"
                        ? "bg-yellow-500"
                        : c.name === "North America"
                          ? "bg-red-500"
                          : c.name === "Asia"
                            ? "bg-orange-500"
                            : "bg-cyan-500",
              }))}
            />
          </motion.div>

          {/* Stadiums */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-wc-gold" />
              <h2 className="font-display font-bold text-white">Stadiums</h2>
              <span className="ml-auto text-xs text-gray-500">
                Total capacity: {TOTAL_STADIUM_CAPACITY.toLocaleString()}
              </span>
            </div>
            <MiniTable
              headers={["Stadium", "City", "Capacity"]}
              rows={STADIUMS.sort((a, b) => b.capacity - a.capacity).map(
                (s) => [
                  s.name,
                  `${s.city} (${s.country.toUpperCase()})`,
                  s.capacity.toLocaleString(),
                ],
              )}
            />
          </motion.div>

          {/* Player Performance Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-purple-400" />
              <h2 className="font-display font-bold text-white">
                Player Score Distribution
              </h2>
            </div>
            <BarChart
              data={stats.players.map((p) => ({
                label: `${p.avatar} ${p.name.split(" ")[0]}`,
                value: p.totalPoints,
                color: "bg-gradient-to-r from-wc-gold/80 to-amber-600",
              }))}
            />
          </motion.div>
        </div>
      </div>

      {/* Round-by-round match results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-sky-400" />
          <h2 className="font-display font-bold text-white">
            Knockout Stage Results
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* R32 */}
          <RoundResultsCard
            title="Round of 32"
            matches={R32_MATCHES}
            color="text-gray-400"
          />
          {/* R16 */}
          <RoundResultsCard
            title="Round of 16"
            matches={R16_MATCHES}
            color="text-sky-400"
          />
          {/* QF+ */}
          <RoundResultsCard
            title="QF / SF / Final"
            matches={[...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCHES]}
            color="text-wc-gold"
          />
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sub-component: Round Results Card ───────────────────────────────────────

function RoundResultsCard({
  title,
  matches,
  color,
}: {
  title: string;
  matches: typeof R32_MATCHES;
  color: string;
}) {
  const finished = matches.filter((m) => m.status === "FINISHED");
  const scheduled = matches.filter((m) => m.status === "SCHEDULED");

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <h3 className={cn("font-display font-bold text-sm mb-3", color)}>
        {title}
        <span className="ml-2 text-xs text-gray-500 font-normal">
          {finished.length}/{matches.length} played
        </span>
      </h3>
      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {finished.map((m) => {
          const hasPens = m.homePenalties != null;
          const homeWon = hasPens
            ? m.homePenalties! > m.awayPenalties!
            : m.homeScore! > m.awayScore!;
          return (
            <div
              key={m.id}
              className="flex items-center gap-2 text-xs py-1 border-b border-white/5 last:border-0"
            >
              <span
                className={cn(
                  "font-medium truncate flex-1 text-right",
                  homeWon ? "text-wc-gold" : "text-gray-400",
                )}
              >
                {m.homeTeam.flag} {m.homeTeam.code}
              </span>
              <span className="font-display font-bold text-white min-w-[40px] text-center">
                {m.homeScore}–{m.awayScore}
              </span>
              <span
                className={cn(
                  "font-medium truncate flex-1",
                  !homeWon ? "text-wc-gold" : "text-gray-400",
                )}
              >
                {m.awayTeam.code} {m.awayTeam.flag}
              </span>
              {hasPens && (
                <span className="text-[9px] text-rose-400 font-medium">
                  (p)
                </span>
              )}
              {m.extraTime && !hasPens && (
                <span className="text-[9px] text-amber-400 font-medium">
                  (aet)
                </span>
              )}
            </div>
          );
        })}
        {scheduled.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-2 text-xs py-1 border-b border-white/5 last:border-0 opacity-50"
          >
            <span className="font-medium truncate flex-1 text-right text-gray-500">
              {m.homeTeam.flag} {m.homeTeam.code}
            </span>
            <span className="font-display font-bold text-gray-600 min-w-[40px] text-center">
              vs
            </span>
            <span className="font-medium truncate flex-1 text-gray-500">
              {m.awayTeam.code} {m.awayTeam.flag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
