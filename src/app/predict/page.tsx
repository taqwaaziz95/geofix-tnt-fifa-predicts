"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  R32_MATCHES,
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";
import {
  getSeededPredictionsForPlayer,
  isExistingLockedPlayer,
} from "@/data/seeded-predictions";
import MatchCard from "@/components/MatchCard";
import PredictionModal from "@/components/PredictionModal";
import { Match, Prediction } from "@/types";
import { Target, LogIn, Lock } from "lucide-react";
import { cn, isMatchLockedByTime } from "@/lib/utils";
import Link from "next/link";
import { useLiveMatches, LiveMatch } from "@/hooks/useLiveMatches";

// QF prediction deadline: July 9 2026 18:00 WIB (= 11:00 UTC)
const QF_LOCK_DATE = new Date("2026-07-09T11:00:00Z");

function isQfLocked(): boolean {
  return Date.now() >= QF_LOCK_DATE.getTime();
}

function qfDeadlineLabel(): string {
  const now = Date.now();
  const diff = QF_LOCK_DATE.getTime() - now;
  if (diff <= 0) return "Predictions are LOCKED";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `Locks in ${d}d ${h % 24}h`;
  }
  return h > 0 ? `Locks in ${h}h ${m}m` : `Locks in ${m}m`;
}

// SF prediction deadline: July 14 2026 19:00 WIB (= 12:00 UTC), 1h before SF1
const SF_LOCK_DATE = new Date("2026-07-14T12:00:00Z");

function isSfLocked(): boolean {
  return Date.now() >= SF_LOCK_DATE.getTime();
}

function sfDeadlineLabel(): string {
  const now = Date.now();
  const diff = SF_LOCK_DATE.getTime() - now;
  if (diff <= 0) return "Predictions are LOCKED";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `Locks in ${d}d ${h % 24}h`;
  }
  return h > 0 ? `Locks in ${h}h ${m}m` : `Locks in ${m}m`;
}

function finalDeadlineLabel(finalDate: string): string {
  const lockAt = new Date(finalDate).getTime() - 60 * 60 * 1000;
  const diff = lockAt - Date.now();
  if (diff <= 0) return "Predictions are LOCKED";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h >= 24) {
    const d = Math.floor(h / 24);
    return `Locks in ${d}d ${h % 24}h`;
  }
  return h > 0 ? `Locks in ${h}h ${m}m` : `Locks in ${m}m`;
}

// ── Merge API live data into static Match objects ─────────────────────────────
// API IDs "89"…"96" map to static IDs "r16-m89"…"r16-m96"
// API IDs "97"…"100" map to static IDs "qf-m97"…"qf-m100"
// API IDs "101"…"102" map to static IDs "sf-m101"…"sf-m102"
function numericId(staticId: string): string {
  return staticId.replace(/^[^-]+-m/, "");
}

function mergeScores(staticMatches: Match[], apiMatches: LiveMatch[]): Match[] {
  return staticMatches.map((sm) => {
    const api = apiMatches.find((a) => a.id === numericId(sm.id));
    if (!api || api.status !== "finished") return sm;
    return {
      ...sm,
      status: "FINISHED" as const,
      homeScore: api.homeScore,
      awayScore: api.awayScore,
      homePenalties: api.homePenaltyScore ?? undefined,
      awayPenalties: api.awayPenaltyScore ?? undefined,
    };
  });
}

function mergeKnockoutMatchData(
  staticMatches: Match[],
  apiMatches: LiveMatch[],
): Match[] {
  return staticMatches.map((sm) => {
    const api = apiMatches.find((a) => a.id === numericId(sm.id));
    if (!api) return sm;
    const homeTeam =
      api.homeTeam && api.homeTeam !== "undefined"
        ? { ...sm.homeTeam, name: api.homeTeam, flag: api.homeFlag }
        : sm.homeTeam;
    const awayTeam =
      api.awayTeam && api.awayTeam !== "undefined"
        ? { ...sm.awayTeam, name: api.awayTeam, flag: api.awayFlag }
        : sm.awayTeam;
    const base = { ...sm, homeTeam, awayTeam };
    if (api.status !== "finished") return base;
    return {
      ...base,
      status: "FINISHED" as const,
      homeScore: api.homeScore,
      awayScore: api.awayScore,
      homePenalties: api.homePenaltyScore ?? undefined,
      awayPenalties: api.awayPenaltyScore ?? undefined,
      homeScorers: api.homeScorers,
      awayScorers: api.awayScorers,
    };
  });
}

function winnerTeamFromApiMatch(match?: LiveMatch) {
  if (!match || match.status !== "finished") return null;
  const hasPenalties =
    match.homePenaltyScore != null && match.awayPenaltyScore != null;
  const homeWins = hasPenalties
    ? match.homePenaltyScore! > match.awayPenaltyScore!
    : match.homeScore > match.awayScore;
  const awayWins = hasPenalties
    ? match.awayPenaltyScore! > match.homePenaltyScore!
    : match.awayScore > match.homeScore;
  if (!homeWins && !awayWins) return null;
  return homeWins
    ? { name: match.homeTeam, flag: match.homeFlag }
    : { name: match.awayTeam, flag: match.awayFlag };
}

function mergeFinalMatchData(
  staticMatches: Match[],
  apiFinalMatches: LiveMatch[],
  apiSfMatches: LiveMatch[],
): Match[] {
  const merged = mergeKnockoutMatchData(staticMatches, apiFinalMatches);
  const sf1Winner = winnerTeamFromApiMatch(
    apiSfMatches.find((m) => m.id === "101"),
  );
  const sf2Winner = winnerTeamFromApiMatch(
    apiSfMatches.find((m) => m.id === "102"),
  );

  return merged.map((match) => {
    if (match.stage !== "FINAL") return match;
    const apiFinal = apiFinalMatches.find((m) => m.id === numericId(match.id));
    const apiHasTeams =
      apiFinal?.homeTeam &&
      apiFinal.awayTeam &&
      apiFinal.homeTeam !== "undefined" &&
      apiFinal.awayTeam !== "undefined";
    if (apiHasTeams || !sf1Winner || !sf2Winner) return match;
    return {
      ...match,
      homeTeam: {
        ...match.homeTeam,
        name: sf1Winner.name,
        flag: sf1Winner.flag,
      },
      awayTeam: {
        ...match.awayTeam,
        name: sf2Winner.name,
        flag: sf2Winner.flag,
      },
    };
  });
}

// Keep old alias for backwards compat
const mergeQfMatchData = mergeKnockoutMatchData;

export default function PredictPage() {
  const { user, profile, predictions, loading } = useAuth();
  const [activeModal, setActiveModal] = useState<Match | null>(null);
  const {
    recentR16,
    r16AllFinished,
    qfMatches: apiQfMatches,
    sfMatches: apiSfMatches,
    finalMatches: apiFinalMatches,
  } = useLiveMatches();

  // Determine if this user is an existing player with locked predictions
  const isLocked = useMemo(() => {
    if (!profile) return false;
    return isExistingLockedPlayer(profile.playerId ?? "");
  }, [profile]);

  // Get the seeded predictions for this existing player
  const seededPreds = useMemo(() => {
    if (!profile || !isLocked) return {};
    return getSeededPredictionsForPlayer(profile.playerId ?? "");
  }, [profile, isLocked]);

  // Merge API scores into static R16 matches (real-time results) — must be before early returns
  const r16WithApiScores = useMemo(
    () => mergeScores(R16_MATCHES, recentR16),
    [recentR16],
  );

  // QF matches with resolved team names + scores from API — must be before early returns
  const qfMatchesMerged = useMemo(
    () => mergeQfMatchData(QF_MATCHES, apiQfMatches),
    [apiQfMatches],
  );

  // SF matches with resolved team names + scores from API
  const sfMatchesMerged = useMemo(
    () => mergeKnockoutMatchData(SF_MATCHES, apiSfMatches),
    [apiSfMatches],
  );

  const finalMatchesMerged = useMemo(
    () =>
      mergeFinalMatchData(
        FINAL_MATCHES.filter((m) => m.stage === "FINAL"),
        apiFinalMatches,
        apiSfMatches,
      ),
    [apiFinalMatches, apiSfMatches],
  );

  // Show SF section when all 4 QF matches are finished OR when API already has SF team names
  const qfAllFinished = useMemo(
    () =>
      apiQfMatches.length >= 4 &&
      apiQfMatches.every((m) => m.status === "finished"),
    [apiQfMatches],
  );

  const sfTeamsKnown = useMemo(
    () =>
      apiSfMatches.length >= 1 &&
      apiSfMatches.some(
        (m) =>
          m.homeTeam &&
          m.homeTeam !== "undefined" &&
          !m.homeTeam.startsWith("Winner"),
      ),
    [apiSfMatches],
  );

  const showSfSection = qfAllFinished || sfTeamsKnown;

  const sfAllFinished = useMemo(
    () =>
      apiSfMatches.length >= 2 &&
      apiSfMatches.every((m) => m.status === "finished"),
    [apiSfMatches],
  );

  const finalTeamsKnown = useMemo(
    () =>
      finalMatchesMerged.some(
        (m) =>
          m.homeTeam.name &&
          m.awayTeam.name &&
          !m.homeTeam.name.startsWith("Winner") &&
          !m.awayTeam.name.startsWith("Winner"),
      ),
    [finalMatchesMerged],
  );

  const showFinalSection = sfAllFinished || finalTeamsKnown;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-4xl trophy-float inline-block">⚽</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4 trophy-float inline-block">🔒</div>
        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Sign in to Predict
        </h2>
        <p className="text-gray-400 mb-6">
          You need to be logged in to make predictions.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-wc-gold text-wc-navy font-display font-bold px-6 py-3 rounded-xl hover:bg-wc-gold-light transition-colors"
        >
          <LogIn size={18} /> Sign In
        </Link>
        <p className="text-gray-600 text-sm mt-4">
          Browse the{" "}
          <Link href="/leaderboard" className="text-wc-gold hover:underline">
            leaderboard
          </Link>{" "}
          or{" "}
          <Link href="/bracket" className="text-wc-gold hover:underline">
            bracket
          </Link>{" "}
          without signing in.
        </p>
      </div>
    );
  }

  // Resolve a prediction: use seeded data for locked users, Firestore for new users
  function toPrediction(matchId: string): Prediction | undefined {
    if (isLocked && seededPreds[matchId]) {
      return {
        matchId,
        winner: seededPreds[matchId],
        submittedAt: "2026-07-05T23:59:00Z",
      };
    }
    const p = predictions[matchId];
    if (!p) return undefined;
    return { matchId, winner: p.winner, submittedAt: "" };
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-display text-2xl font-black text-white flex items-center gap-2">
              <Target size={22} className="text-wc-gold" /> My Predictions
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Playing as{" "}
              <span className="text-wc-gold font-semibold">
                {profile.avatar} {profile.displayName}
              </span>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Points guide */}
      <div className="glass-card p-4">
        <h3 className="font-display font-bold text-sm text-gray-400 mb-3">
          Points Guide
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { stage: "Round of 32", pts: 2, color: "text-gray-400" },
            { stage: "Round of 16", pts: 4, color: "text-wc-blue" },
            { stage: "Quarter-final", pts: 8, color: "text-wc-purple" },
            { stage: "Semi-final", pts: 16, color: "text-wc-gold" },
            { stage: "Final", pts: 20, color: "text-yellow-300" },
          ].map((item) => (
            <div
              key={item.stage}
              className="text-center bg-white/5 rounded-xl p-3"
            >
              <p className={cn("font-display text-xl font-bold", item.color)}>
                +{item.pts}
              </p>
              <p className="text-xs text-gray-500">{item.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Semi-Final Predictions (TOP — current active stage) ── */}
      {showFinalSection && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="font-display font-bold text-yellow-300 text-sm">
                Final Prediction
              </p>
              <p className="text-xs text-gray-400">
                Pick the World Cup champion
              </p>
            </div>
          </div>

          {finalMatchesMerged.map((match, i) => {
            const hasPrediction = !!predictions[match.id];
            const locked = hasPrediction || isMatchLockedByTime(match.date);
            return (
              <div key={match.id} className="space-y-2">
                <div className="flex items-center justify-between gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Lock size={14} className="text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-amber-300">
                      Deadline: <strong>1 hour before kickoff</strong>. Once
                      locked, no changes allowed.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-amber-400 tabular-nums flex-shrink-0">
                    {finalDeadlineLabel(match.date)}
                  </span>
                </div>
                <MatchCard
                  match={match}
                  prediction={
                    predictions[match.id]
                      ? {
                          matchId: match.id,
                          winner: predictions[match.id].winner,
                          submittedAt: "",
                        }
                      : undefined
                  }
                  onPredict={locked ? undefined : setActiveModal}
                  index={i}
                />
              </div>
            );
          })}
        </div>
      )}

      {showSfSection && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-wc-gold/10 border border-wc-gold/30 rounded-xl px-4 py-3">
            <span className="text-xl">🏟️</span>
            <div>
              <p className="font-display font-bold text-wc-gold text-sm">
                Semi-Finals Predictions
              </p>
              <p className="text-xs text-gray-400">
                Predict who advances to the Final
              </p>
            </div>
          </div>

          {/* SF deadline banner */}
          {isSfLocked() ? (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/40 rounded-xl px-4 py-3">
              <Lock size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300 font-semibold">
                SF predictions are <strong>LOCKED</strong> — deadline was Jul 14
                at 19:00 WIB.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">
                  Deadline: <strong>Jul 14 · 19:00 WIB</strong>. Once locked, no
                  changes allowed.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 tabular-nums flex-shrink-0">
                {sfDeadlineLabel()}
              </span>
            </div>
          )}

          {sfMatchesMerged.map((match, i) => {
            const hasPrediction = !!predictions[match.id];
            const locked =
              hasPrediction || isSfLocked() || isMatchLockedByTime(match.date);
            return (
              <MatchCard
                key={match.id}
                match={match}
                prediction={
                  predictions[match.id]
                    ? {
                        matchId: match.id,
                        winner: predictions[match.id].winner,
                        submittedAt: "",
                      }
                    : undefined
                }
                onPredict={locked ? undefined : setActiveModal}
                index={i}
              />
            );
          })}
        </div>
      )}

      {/* ── Quarter-Final Predictions ── */}
      {r16AllFinished && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-wc-gold/10 border border-wc-gold/30 rounded-xl px-4 py-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="font-display font-bold text-wc-gold text-sm">
                Quarter-Finals Predictions
              </p>
              <p className="text-xs text-gray-400">
                Predict who advances to the Semi-Finals
              </p>
            </div>
          </div>

          {/* QF deadline banner */}
          {isQfLocked() ? (
            <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/40 rounded-xl px-4 py-3">
              <Lock size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300 font-semibold">
                QF predictions are <strong>LOCKED</strong> — deadline was Jul 9
                at 18:00 WIB.
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-300">
                  Deadline: <strong>Jul 9 · 18:00 WIB</strong>. Once locked, no
                  changes allowed.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-400 tabular-nums flex-shrink-0">
                {qfDeadlineLabel()}
              </span>
            </div>
          )}

          {qfMatchesMerged.map((match, i) => {
            const hasPrediction = !!predictions[match.id];
            // Lock if: already predicted, past QF global deadline, or within 1h of kickoff
            const locked =
              hasPrediction || isQfLocked() || isMatchLockedByTime(match.date);
            return (
              <MatchCard
                key={match.id}
                match={match}
                prediction={
                  predictions[match.id]
                    ? {
                        matchId: match.id,
                        winner: predictions[match.id].winner,
                        submittedAt: "",
                      }
                    : undefined
                }
                onPredict={locked ? undefined : setActiveModal}
                index={i}
              />
            );
          })}
        </div>
      )}

      {/* ── R16 Results & Predictions History ── */}
      {r16WithApiScores.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-gray-400 flex items-center gap-2">
            📋 R16 Results & My Picks
          </h2>
          {r16WithApiScores
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((match, i) => (
              <MatchCard
                key={match.id}
                match={match}
                prediction={toPrediction(match.id)}
                showPoints={match.status === "FINISHED"}
                earnedPoints={4}
                index={i}
              />
            ))}
        </div>
      )}

      {/* ── R32 Results & My Picks ── */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-gray-400 flex items-center gap-2">
          📋 R32 Results & My Picks
        </h2>
        {R32_MATCHES.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ).map((match, i) => (
          <MatchCard
            key={match.id}
            match={match}
            prediction={toPrediction(match.id)}
            showPoints={match.status === "FINISHED"}
            earnedPoints={2}
            index={i}
          />
        ))}
      </div>

      {activeModal && (
        <PredictionModal
          match={activeModal}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
