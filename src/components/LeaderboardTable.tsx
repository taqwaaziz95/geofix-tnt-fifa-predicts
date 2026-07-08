"use client";

import { motion } from "framer-motion";
import { LeaderboardEntry } from "@/types";
import { getRankEmoji, getRankBg, getRankColor, cn } from "@/lib/utils";

type StageFilter = "all" | "group" | "r32" | "r16" | "qf" | "sf" | "final";

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

function stageLabel(stage: StageFilter): string {
  const map: Record<StageFilter, string> = {
    all: "pts",
    group: "Group pts",
    r32: "R32 pts",
    r16: "R16 pts",
    qf: "QF pts",
    sf: "SF pts",
    final: "Final pts",
  };
  return map[stage];
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightId?: string;
  compact?: boolean;
  stage?: StageFilter;
}

export default function LeaderboardTable({
  entries,
  highlightId,
  compact,
  stage = "all",
}: LeaderboardTableProps) {
  return (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const isHighlighted = entry.id === highlightId;

        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04 }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
              getRankBg(entry.rank),
              isHighlighted && "ring-2 ring-wc-gold/40",
              compact ? "py-2" : "py-3",
            )}
          >
            {/* Rank */}
            <div className="w-10 text-center flex-shrink-0">
              {entry.rank <= 3 ? (
                <span className="text-xl">{getRankEmoji(entry.rank)}</span>
              ) : (
                <span
                  className={cn(
                    "font-display font-bold text-sm",
                    getRankColor(entry.rank),
                  )}
                >
                  #{entry.rank}
                </span>
              )}
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xl flex-shrink-0">{entry.avatar}</span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-display font-bold truncate",
                    compact ? "text-sm" : "text-base",
                    isHighlighted ? "text-wc-gold" : "text-white",
                  )}
                >
                  {entry.name}
                  {isHighlighted && (
                    <span className="ml-1 text-xs text-wc-gold/70 font-normal">
                      (you)
                    </span>
                  )}
                </p>
                {!compact && (
                  <p className="text-xs text-gray-500 truncate">
                    {entry.correctPredictions} correct picks
                  </p>
                )}
              </div>
            </div>

            {/* Stats */}
            {!compact && (
              <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                {stage === "all" ? (
                  <>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Group</p>
                      <p className="text-sm font-bold text-gray-300">
                        {entry.groupPoints}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">KO</p>
                      <p className="text-sm font-bold text-blue-300">
                        {entry.knockoutPoints}
                      </p>
                    </div>
                    <div className="text-center border-l border-white/10 pl-3">
                      <p className="text-xs text-gray-600">R32</p>
                      <p className="text-sm font-bold text-gray-400">
                        {entry.r32Points}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">R16</p>
                      <p className="text-sm font-bold text-gray-400">
                        {entry.r16Points}
                      </p>
                    </div>
                    {entry.qfPoints > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">QF</p>
                        <p className="text-sm font-bold text-gray-300">
                          {entry.qfPoints}
                        </p>
                      </div>
                    )}
                    {entry.sfPoints > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">SF</p>
                        <p className="text-sm font-bold text-gray-300">
                          {entry.sfPoints}
                        </p>
                      </div>
                    )}
                    {entry.finalPoints > 0 && (
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Final</p>
                        <p className="text-sm font-bold text-gray-300">
                          {entry.finalPoints}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-xs text-gray-500">{stageLabel(stage)}</p>
                    <p className="text-sm font-bold text-wc-gold">
                      {stagePoints(entry, stage)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Stage / Total points */}
            <div className="flex-shrink-0 text-right">
              <p
                className={cn(
                  "font-display font-bold",
                  entry.rank === 1
                    ? "text-wc-gold text-xl gold-glow-text"
                    : entry.rank === 2
                      ? "text-gray-300 text-lg"
                      : entry.rank === 3
                        ? "text-amber-600 text-lg"
                        : "text-white text-base",
                )}
              >
                {stagePoints(entry, stage)}
              </p>
              <p className="text-xs text-gray-600">
                {stage === "all" ? "total" : stageLabel(stage)}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
