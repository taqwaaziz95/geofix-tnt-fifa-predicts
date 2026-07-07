"use client";

import { useMemo } from "react";
import { Match } from "@/types";
import { cn } from "@/lib/utils";
import { useLiveMatches, LiveMatch } from "@/hooks/useLiveMatches";
import {
  R32_MATCHES,
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";

// Extract trailing number: "r16-m89" → "89", "third-place-m103" → "103"
function numId(staticId: string): string {
  return staticId.match(/(\d+)$/)?.[1] ?? staticId;
}

function mergeMatch(sm: Match, api: LiveMatch | undefined): Match {
  if (!api) return sm;
  const homeTeam =
    api.homeTeam && api.homeTeam !== "undefined"
      ? {
          ...sm.homeTeam,
          name: api.homeTeam,
          code: api.homeTeam.slice(0, 3).toUpperCase(),
          flag: api.homeFlag,
        }
      : sm.homeTeam;
  const awayTeam =
    api.awayTeam && api.awayTeam !== "undefined"
      ? {
          ...sm.awayTeam,
          name: api.awayTeam,
          code: api.awayTeam.slice(0, 3).toUpperCase(),
          flag: api.awayFlag,
        }
      : sm.awayTeam;
  const status: Match["status"] =
    api.status === "live"
      ? "LIVE"
      : api.status === "finished"
        ? "FINISHED"
        : "SCHEDULED";
  return {
    ...sm,
    homeTeam,
    awayTeam,
    status,
    homeScore: api.status !== "notstarted" ? api.homeScore : sm.homeScore,
    awayScore: api.status !== "notstarted" ? api.awayScore : sm.awayScore,
    homePenalties: api.homePenaltyScore ?? sm.homePenalties,
    awayPenalties: api.awayPenaltyScore ?? sm.awayPenalties,
  };
}

const BIG_TEAMS = new Set([
  "Brazil",
  "Germany",
  "Argentina",
  "France",
  "England",
  "Spain",
  "Portugal",
  "Netherlands",
  "Belgium",
  "Italy",
]);
const UPSET_COLORS = [
  "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "bg-red-500/15 text-red-400 border-red-500/30",
  "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
];

function detectUpsets(matches: LiveMatch[]) {
  let ci = 0;
  return matches
    .filter((m) => m.status === "finished")
    .flatMap((m) => {
      const homeWon =
        m.homePenaltyScore !== null
          ? (m.homePenaltyScore ?? 0) > (m.awayPenaltyScore ?? 0)
          : m.homeScore > m.awayScore;
      const winner = homeWon ? m.homeTeam : m.awayTeam;
      const loser = homeWon ? m.awayTeam : m.homeTeam;
      const winnerFlag = homeWon ? m.homeFlag : m.awayFlag;
      if (!BIG_TEAMS.has(loser) || BIG_TEAMS.has(winner)) return [];
      const stageLabel =
        m.stage === "R32"
          ? "R32"
          : m.stage === "R16"
            ? "R16"
            : m.stage === "QF"
              ? "QF"
              : "";
      return [
        {
          flag: winnerFlag,
          text: `${winner} eliminated ${loser}${stageLabel ? ` (${stageLabel})` : ""}!`,
          color: UPSET_COLORS[ci++ % UPSET_COLORS.length],
        },
      ];
    });
}

function BracketMatch({ match }: { match: Match }) {
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "LIVE";
  const hasPenalties =
    (isFinished || isLive) &&
    match.homePenalties != null &&
    match.awayPenalties != null;
  const homeWon =
    (isFinished || isLive) &&
    (hasPenalties
      ? (match.homePenalties ?? 0) > (match.awayPenalties ?? 0)
      : (match.homeScore ?? 0) > (match.awayScore ?? 0));
  const awayWon =
    (isFinished || isLive) &&
    (hasPenalties
      ? (match.awayPenalties ?? 0) > (match.homePenalties ?? 0)
      : (match.awayScore ?? 0) > (match.homeScore ?? 0));

  // TBD = API hasn't resolved the team name yet (id still tbd-* AND name is still a placeholder)
  const homeTBD =
    match.homeTeam.name.startsWith("Winner") ||
    match.homeTeam.name.startsWith("Loser");
  const awayTBD =
    match.awayTeam.name.startsWith("Winner") ||
    match.awayTeam.name.startsWith("Loser");
  const isTBD = homeTBD && awayTBD; // only full-TBD gets the placeholder card

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
        isLive
          ? "border-wc-red/60 shadow-[0_0_12px_rgba(255,71,87,0.2)]"
          : "border-white/15",
      )}
    >
      {/* Label row + live pulse */}
      <div className="px-2 py-1 bg-white/5 text-center flex items-center justify-center gap-1.5">
        <span className="text-xs text-gray-500 font-medium">{match.label}</span>
        {isLive && (
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wc-red opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wc-red" />
          </span>
        )}
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
              homeWon
                ? "text-wc-gold"
                : homeTBD
                  ? "text-gray-500"
                  : "text-gray-300",
            )}
          >
            {homeTBD ? match.homeTeam.name : match.homeTeam.code}
          </span>
          {(isFinished || isLive) && match.homeScore !== undefined && (
            <span
              className={cn(
                "font-display font-bold text-base w-5 text-center",
                homeWon ? "text-wc-gold" : "text-gray-500",
              )}
            >
              {match.homeScore}
            </span>
          )}
          {hasPenalties && (
            <span className="text-xs text-gray-500">
              ({match.homePenalties})
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
              awayWon
                ? "text-wc-gold"
                : awayTBD
                  ? "text-gray-500"
                  : "text-gray-300",
            )}
          >
            {awayTBD ? match.awayTeam.name : match.awayTeam.code}
          </span>
          {(isFinished || isLive) && match.awayScore !== undefined && (
            <span
              className={cn(
                "font-display font-bold text-base w-5 text-center",
                awayWon ? "text-wc-gold" : "text-gray-500",
              )}
            >
              {match.awayScore}
            </span>
          )}
          {hasPenalties && (
            <span className="text-xs text-gray-500">
              ({match.awayPenalties})
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

export default function BracketView() {
  const { allByApiId, r32Results, recentR16, isLoading } = useLiveMatches();

  const r32 = useMemo(
    () => R32_MATCHES.map((sm) => mergeMatch(sm, allByApiId[numId(sm.id)])),
    [allByApiId],
  );
  const r16 = useMemo(
    () => R16_MATCHES.map((sm) => mergeMatch(sm, allByApiId[numId(sm.id)])),
    [allByApiId],
  );
  const qf = useMemo(
    () => QF_MATCHES.map((sm) => mergeMatch(sm, allByApiId[numId(sm.id)])),
    [allByApiId],
  );
  const sf = useMemo(
    () => SF_MATCHES.map((sm) => mergeMatch(sm, allByApiId[numId(sm.id)])),
    [allByApiId],
  );
  const finals = useMemo(
    () => FINAL_MATCHES.map((sm) => mergeMatch(sm, allByApiId[numId(sm.id)])),
    [allByApiId],
  );

  const upsets = useMemo(
    () => detectUpsets([...r32Results, ...recentR16]),
    [r32Results, recentR16],
  );

  return (
    <div className="space-y-4">
      {!isLoading && (
        <div className="flex items-center gap-2 px-4 text-xs text-gray-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wc-green opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-wc-green" />
          </span>
          Live bracket · updates every 5 min
        </div>
      )}

      {upsets.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4">
          {upsets.map((u) => (
            <span
              key={u.text}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${u.color}`}
            >
              {u.flag} {u.text}
            </span>
          ))}
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max px-4">
          <BracketRound
            label="Round of 32 (1–8)"
            matches={r32.slice(0, 8)}
            stageColor="text-gray-500"
          />
          <BracketRound
            label="Round of 32 (9–16)"
            matches={r32.slice(8)}
            stageColor="text-gray-500"
          />
          <BracketRound
            label="Round of 16"
            matches={r16}
            stageColor="text-wc-blue"
          />
          <BracketRound
            label="Quarter-finals"
            matches={qf}
            stageColor="text-wc-purple"
          />
          <BracketRound
            label="Semi-finals"
            matches={sf}
            stageColor="text-wc-gold"
          />
          <BracketRound
            label="Final"
            matches={finals}
            stageColor="text-wc-gold"
          />
        </div>
      </div>
    </div>
  );
}
