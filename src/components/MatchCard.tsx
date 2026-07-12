"use client";

import { motion } from "framer-motion";
import { Match, Prediction } from "@/types";
import {
  formatMatchDateWIB,
  isMatchLockedByTime,
  getStageLabel,
  getStagePts,
  cn,
} from "@/lib/utils";
import { CheckCircle2, XCircle, Lock, Clock } from "lucide-react";

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

  // Lock 1 hour before kickoff (also covers live & finished)
  const timeLocked = isMatchLockedByTime(match.date);
  const canPredict =
    isScheduled && !timeLocked && !!onPredict && !hasPrediction;

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
      {/* Stage badge + time */}
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
          {isScheduled &&
            (() => {
              const { venueTime, wib, date: d } = formatMatchDateWIB(match.date, match.venue);
              return (
                <div className="text-right">
                  <p className="text-[11px] text-gray-400 leading-tight">{d}</p>
                  <p className="text-[11px] text-gray-500 leading-tight">
                    {venueTime}
                    <span className="mx-1 text-gray-700">·</span>
                    <span className="text-wc-blue/80">{wib}</span>
                  </p>
                </div>
              );
            })()}
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

      {/* Scorers (finished matches) */}
      {isFinished && (match.homeScorers?.length || match.awayScorers?.length) ? (
        <div className="mt-2 flex justify-between text-[10px] text-gray-500 gap-2">
          <div className="flex-1 space-y-0.5">
            {match.homeScorers?.map((s, i) => (
              <p key={i}>⚽ {s}</p>
            ))}
          </div>
          <div className="flex-1 text-right space-y-0.5">
            {match.awayScorers?.map((s, i) => (
              <p key={i}>{s} ⚽</p>
            ))}
          </div>
        </div>
      ) : null}

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
          {/* Not predicted on a finished match */}
          {!hasPrediction && isFinished && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-700/50 text-gray-500 italic">
              <XCircle size={11} />
              Not Predicted
            </span>
          )}
          {/* Upcoming but prediction window closed */}
          {!hasPrediction && isScheduled && timeLocked && (
            <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-wc-red/10 text-wc-red/70 italic">
              <Lock size={10} />
              Not Predicted
            </span>
          )}
          {!hasPrediction && isScheduled && !timeLocked && (
            <span className="text-xs text-gray-600 italic">
              No prediction yet
            </span>
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
          {!showPoints && pointsForStage > 0 && isScheduled && !timeLocked && (
            <span className="text-xs text-wc-gold/60 font-medium">
              +{pointsForStage} pts if correct
            </span>
          )}

          {/* Can predict: window open, no prediction yet */}
          {canPredict && (
            <button
              onClick={() => onPredict!(match)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 bg-wc-gold text-wc-navy hover:bg-wc-gold-light"
            >
              Predict
            </button>
          )}

          {/* Already predicted + window open = locked in */}
          {hasPrediction && isScheduled && !timeLocked && (
            <span className="flex items-center gap-1 text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <Lock size={10} />
              <span className="font-medium">Locked in</span>
            </span>
          )}

          {/* Window closed (live / <1hr / finished) + scheduled */}
          {isScheduled && timeLocked && (
            <span className="flex items-center gap-1 text-xs text-wc-red/70 bg-wc-red/10 px-2 py-1 rounded-lg border border-wc-red/20">
              <Lock size={10} />
              <span className="font-medium">Closed</span>
            </span>
          )}

          {!isScheduled && !hasPrediction && (
            <Lock size={12} className="text-gray-600" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
