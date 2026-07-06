"use client";

import { motion } from "framer-motion";
import { Match, Prediction } from "@/types";
import { formatMatchDate, getStageLabel, getStagePts, cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle, Lock } from "lucide-react";

interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  onPredict?: (match: Match) => void;
  showPoints?: boolean;
  earnedPoints?: number;
  index?: number;
}

export default function MatchCard({
  match,
  prediction,
  onPredict,
  showPoints,
  earnedPoints,
  index = 0,
}: MatchCardProps) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const isScheduled = match.status === "SCHEDULED";
  const hasPrediction = !!prediction;

  const predictedWinner = prediction?.winner;
  const hasPenalties =
    isFinished && match.homePenalties != null && match.awayPenalties != null;
  const actualWinner = isFinished
    ? hasPenalties
      ? match.homePenalties! > match.awayPenalties!
        ? match.homeTeam.name
        : match.awayTeam.name
      : match.homeScore! > match.awayScore!
        ? match.homeTeam.name
        : match.awayScore! > match.homeScore!
          ? match.awayTeam.name
          : "draw"
    : null;

  const isCorrect =
    hasPrediction && actualWinner && predictedWinner === actualWinner;
  const isWrong =
    hasPrediction && actualWinner && predictedWinner !== actualWinner;
  const pointsForStage = getStagePts(match.stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "match-card-hover glass-card p-4 relative overflow-hidden",
        isCorrect && "border-wc-green/40",
        isWrong && "border-wc-red/30",
        isLive && "border-wc-gold/40 gold-glow",
      )}
    >
      {/* Stage badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">
          {getStageLabel(match.stage)} · {match.label}
        </span>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-wc-red bg-wc-red/15 px-2 py-0.5 rounded-full">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-wc-red inline-block" />
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="text-xs font-medium text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
              FT
            </span>
          )}
          {isScheduled && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={11} />
              {formatMatchDate(match.date)}
            </span>
          )}
        </div>
      </div>

      {/* Match */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-2xl">{match.homeTeam.flag}</span>
          <div className="min-w-0">
            <p className="font-display font-bold text-white text-sm leading-tight truncate">
              {match.homeTeam.name}
            </p>
            <p className="text-xs text-gray-500">{match.homeTeam.code}</p>
          </div>
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 text-center">
          {(isFinished || isLive) && match.homeScore !== undefined ? (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className="font-display text-2xl font-bold text-wc-gold">
                  {match.homeScore}
                </span>
                <span className="text-gray-600 font-bold">—</span>
                <span className="font-display text-2xl font-bold text-wc-gold">
                  {match.awayScore}
                </span>
              </div>
              {hasPenalties && (
                <span className="text-[10px] text-gray-500 font-medium">
                  ({match.homePenalties}–{match.awayPenalties} pen)
                </span>
              )}
              {match.extraTime && !hasPenalties && (
                <span className="text-[10px] text-gray-500 font-medium">
                  (aet)
                </span>
              )}
            </div>
          ) : (
            <span className="font-display text-lg font-bold text-gray-600 px-2">
              VS
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          <div className="min-w-0 text-right">
            <p className="font-display font-bold text-white text-sm leading-tight truncate">
              {match.awayTeam.name}
            </p>
            <p className="text-xs text-gray-500">{match.awayTeam.code}</p>
          </div>
          <span className="text-2xl">{match.awayTeam.flag}</span>
        </div>
      </div>

      {/* Venue */}
      {match.venue && (
        <p className="text-xs text-gray-600 mt-2 truncate">{match.venue}</p>
      )}

      {/* Prediction / Points row */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasPrediction && (
            <span
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                isCorrect
                  ? "bg-wc-green/20 text-wc-green"
                  : isWrong
                    ? "bg-wc-red/20 text-wc-red"
                    : "bg-white/10 text-gray-400",
              )}
            >
              {isCorrect && <CheckCircle2 size={11} />}
              {isWrong && <XCircle size={11} />}
              {!isCorrect && !isWrong && <Clock size={11} />}
              <span className="font-medium">
                {predictedWinner === "draw" ? "Draw" : predictedWinner}
              </span>
            </span>
          )}
          {!hasPrediction && isScheduled && (
            <span className="text-xs text-gray-600 italic">No prediction</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showPoints && isCorrect && earnedPoints !== undefined && (
            <span className="font-display font-bold text-wc-green text-sm">
              +{earnedPoints} pts
            </span>
          )}
          {showPoints && isWrong && (
            <span className="font-display font-bold text-gray-600 text-sm">
              +0 pts
            </span>
          )}
          {!showPoints && pointsForStage > 0 && isScheduled && (
            <span className="text-xs text-wc-gold/60 font-medium">
              +{pointsForStage} pts if correct
            </span>
          )}

          {isScheduled && onPredict && (
            <button
              onClick={() => onPredict(match)}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200",
                hasPrediction
                  ? "bg-wc-gold/10 text-wc-gold border border-wc-gold/30 hover:bg-wc-gold/20"
                  : "bg-wc-gold text-wc-navy hover:bg-wc-gold-light",
              )}
            >
              {hasPrediction ? "Edit" : "Predict"}
            </button>
          )}

          {!isScheduled && !onPredict && (
            <Lock size={12} className="text-gray-600" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
