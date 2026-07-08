"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { LiveMatch } from "@/hooks/useLiveMatches";
import { cn } from "@/lib/utils";

// ── Single result row ────────────────────────────────────────────────────
export function ApiResultCard({
  match,
  index = 0,
}: {
  match: LiveMatch;
  index?: number;
}) {
  const homeWon =
    match.homePenaltyScore !== null
      ? match.homePenaltyScore > (match.awayPenaltyScore ?? 0)
      : match.homeScore > match.awayScore;
  const awayWon =
    match.homePenaltyScore !== null
      ? (match.awayPenaltyScore ?? 0) > match.homePenaltyScore
      : match.awayScore > match.homeScore;
  const hasPens =
    match.homePenaltyScore !== null && match.awayPenaltyScore !== null;

  const stageLabel =
    match.stage === "R16"
      ? "Round of 16"
      : match.stage === "R32"
        ? "Round of 32"
        : match.stage === "QF"
          ? "Quarter-Final"
          : match.stage === "SF"
            ? "Semi-Final"
            : match.stage === "FINAL"
              ? "Final"
              : `Group ${match.stage}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="glass-card px-4 py-3"
    >
      <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">
        {stageLabel} · {match.localDate.split(" ")[0]}
      </p>

      <div className="flex items-center gap-3">
        {/* Home */}
        <div
          className={cn(
            "flex-1 flex items-center gap-2",
            homeWon ? "opacity-100" : "opacity-50",
          )}
        >
          <span className="text-xl">{match.homeFlag}</span>
          <span
            className={cn(
              "font-display font-bold text-sm",
              homeWon ? "text-white" : "text-gray-400",
            )}
          >
            {match.homeTeam}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center min-w-[60px]">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-display text-xl font-black tabular-nums",
                homeWon ? "text-white" : "text-gray-400",
              )}
            >
              {match.homeScore}
            </span>
            <span className="text-gray-600 font-bold text-sm">–</span>
            <span
              className={cn(
                "font-display text-xl font-black tabular-nums",
                awayWon ? "text-white" : "text-gray-400",
              )}
            >
              {match.awayScore}
            </span>
          </div>
          {hasPens && (
            <span className="text-[10px] text-gray-500 mt-0.5">
              ({match.homePenaltyScore} – {match.awayPenaltyScore}) pens
            </span>
          )}
          <span className="text-[10px] font-bold text-gray-600 mt-0.5">FT</span>
        </div>

        {/* Away */}
        <div
          className={cn(
            "flex-1 flex items-center gap-2 justify-end",
            awayWon ? "opacity-100" : "opacity-50",
          )}
        >
          <span
            className={cn(
              "font-display font-bold text-sm text-right",
              awayWon ? "text-white" : "text-gray-400",
            )}
          >
            {match.awayTeam}
          </span>
          <span className="text-xl">{match.awayFlag}</span>
        </div>
      </div>

      {/* Scorers */}
      {(match.homeScorers.length > 0 || match.awayScorers.length > 0) && (
        <div className="mt-2 flex justify-between text-[10px] text-gray-500 gap-2">
          <div className="flex-1 space-y-0.5">
            {match.homeScorers.map((s, i) => (
              <p key={i}>⚽ {s}</p>
            ))}
          </div>
          <div className="flex-1 text-right space-y-0.5">
            {match.awayScorers.map((s, i) => (
              <p key={i}>{s} ⚽</p>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Collapsible results list ──────────────────────────────────────────────────
export function ResultsList({
  matches,
  title,
  icon,
  initialShow = 5,
}: {
  matches: LiveMatch[];
  title: string;
  icon: string;
  initialShow?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? matches : matches.slice(0, initialShow);
  const hasMore = matches.length > initialShow;

  if (matches.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
          {icon} {title}
          <span className="text-xs font-normal text-gray-500 font-sans">
            ({matches.length})
          </span>
        </h2>
        {hasMore && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1 text-xs text-wc-gold hover:text-wc-gold/80 transition-colors"
          >
            {showAll ? (
              <>
                Show less <ChevronUp size={12} />
              </>
            ) : (
              <>
                Show all {matches.length} <ChevronDown size={12} />
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visible.map((m, i) => (
          <ApiResultCard key={m.id} match={m} index={i} />
        ))}
      </div>

      <AnimatePresence>
        {!showAll && hasMore && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAll(true)}
            className="w-full glass-card py-2.5 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-colors flex items-center justify-center gap-1.5"
          >
            <ChevronDown size={14} />
            {matches.length - initialShow} more results
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
