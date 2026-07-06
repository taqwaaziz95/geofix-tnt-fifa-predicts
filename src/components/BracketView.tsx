"use client";

import { Match } from "@/types";
import { cn } from "@/lib/utils";

interface BracketMatchProps {
  match: Match;
}

function BracketMatch({ match }: BracketMatchProps) {
  const isFinished = match.status === "FINISHED";
  const homeWon = isFinished && match.homeScore! > match.awayScore!;
  const awayWon = isFinished && match.awayScore! > match.homeScore!;
  const isTBD = match.homeTeam.id.startsWith("tbd");

  if (isTBD && !isFinished) {
    return (
      <div className="bg-white/5 border border-dashed border-white/15 rounded-xl p-3 text-center min-w-[160px]">
        <p className="text-xs text-gray-600 font-medium">{match.label}</p>
        <p className="text-sm text-gray-500 mt-1">TBD</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white/5 border rounded-xl overflow-hidden min-w-[170px]",
        match.status === "LIVE" ? "border-wc-gold/50" : "border-white/15",
      )}
    >
      <div className="px-2 py-1 bg-white/5 text-center">
        <span className="text-xs text-gray-500 font-medium">{match.label}</span>
      </div>
      <div className="p-2 space-y-1.5">
        {/* Home team */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg",
            homeWon ? "bg-wc-gold/15" : "bg-transparent",
          )}
        >
          <span className="text-base">{match.homeTeam.flag}</span>
          <span
            className={cn(
              "flex-1 text-sm font-semibold truncate",
              homeWon ? "text-wc-gold" : "text-gray-300",
            )}
          >
            {match.homeTeam.code}
          </span>
          {isFinished && (
            <span
              className={cn(
                "font-display font-bold text-base w-5 text-center",
                homeWon ? "text-wc-gold" : "text-gray-500",
              )}
            >
              {match.homeScore}
            </span>
          )}
        </div>
        {/* Away team */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-lg",
            awayWon ? "bg-wc-gold/15" : "bg-transparent",
          )}
        >
          <span className="text-base">{match.awayTeam.flag}</span>
          <span
            className={cn(
              "flex-1 text-sm font-semibold truncate",
              awayWon ? "text-wc-gold" : "text-gray-300",
            )}
          >
            {match.awayTeam.code}
          </span>
          {isFinished && (
            <span
              className={cn(
                "font-display font-bold text-base w-5 text-center",
                awayWon ? "text-wc-gold" : "text-gray-500",
              )}
            >
              {match.awayScore}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface BracketRoundProps {
  label: string;
  matches: Match[];
  stageColor?: string;
}

function BracketRound({
  label,
  matches,
  stageColor = "text-gray-400",
}: BracketRoundProps) {
  return (
    <div className="flex flex-col">
      <h3
        className={cn(
          "font-display font-bold text-sm text-center mb-3 sticky top-0",
          stageColor,
        )}
      >
        {label}
      </h3>
      <div className="flex flex-col justify-around gap-4 flex-1">
        {matches.map((match) => (
          <BracketMatch key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

import {
  R32_MATCHES,
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";

export default function BracketView() {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max px-4">
        {/* R32 — split into two halves for readability */}
        <BracketRound
          label="Round of 32 (1–8)"
          matches={R32_MATCHES.slice(0, 8)}
          stageColor="text-gray-500"
        />
        <BracketRound
          label="Round of 32 (9–16)"
          matches={R32_MATCHES.slice(8)}
          stageColor="text-gray-500"
        />

        {/* R16 */}
        <BracketRound
          label="Round of 16"
          matches={R16_MATCHES}
          stageColor="text-wc-blue"
        />

        {/* QF */}
        <BracketRound
          label="Quarter-finals"
          matches={QF_MATCHES}
          stageColor="text-wc-purple"
        />

        {/* SF */}
        <BracketRound
          label="Semi-finals"
          matches={SF_MATCHES}
          stageColor="text-wc-gold"
        />

        {/* Final */}
        <BracketRound
          label="Final"
          matches={FINAL_MATCHES}
          stageColor="text-wc-gold"
        />
      </div>
    </div>
  );
}
