"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLiveMatches, LiveMatch } from "@/hooks/useLiveMatches";
import { cn } from "@/lib/utils";

// ── Score atoms ──────────────────────────────────────────────────────────────
function ScoreBlock({ match }: { match: LiveMatch }) {
  const hasPens =
    match.homePenaltyScore !== null && match.awayPenaltyScore !== null;

  return (
    <div className="flex flex-col items-center min-w-[4rem]">
      <div className="flex items-center gap-3">
        <span className="font-display text-3xl font-black text-white tabular-nums">
          {match.homeScore}
        </span>
        <span className="text-gray-500 font-bold">–</span>
        <span className="font-display text-3xl font-black text-white tabular-nums">
          {match.awayScore}
        </span>
      </div>
      {hasPens && (
        <p className="text-xs text-gray-400 mt-0.5">
          ({match.homePenaltyScore} – {match.awayPenaltyScore}) pens
        </p>
      )}
    </div>
  );
}

// ── Single live card ──────────────────────────────────────────────────────────
function LiveCard({ match }: { match: LiveMatch }) {
  const isLive = match.status === "live";

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border px-5 py-4",
        isLive ? "border-wc-red/40 bg-wc-red/5" : "border-white/10 bg-white/5",
      )}
    >
      {/* Live pulse ring */}
      {isLive && (
        <span className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wc-red opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-wc-red" />
          </span>
          <span className="text-xs font-bold text-wc-red tracking-widest">
            LIVE
          </span>
        </span>
      )}

      {/* Stage badge */}
      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-3">
        {match.stage} · {match.venueTime} · {match.wibTime}
      </p>

      {/* Teams + Score */}
      <div className="flex items-center justify-between gap-3">
        {/* Home */}
        <div className="flex-1 text-right">
          <p className="text-2xl mb-1">{match.homeFlag}</p>
          <p className="font-display font-bold text-sm text-white leading-tight">
            {match.homeTeam}
          </p>
          {match.homeScorers.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {match.homeScorers.map((s, i) => (
                <p key={i} className="text-[10px] text-gray-400">
                  ⚽ {s}
                </p>
              ))}
            </div>
          )}
        </div>

        <ScoreBlock match={match} />

        {/* Away */}
        <div className="flex-1 text-left">
          <p className="text-2xl mb-1">{match.awayFlag}</p>
          <p className="font-display font-bold text-sm text-white leading-tight">
            {match.awayTeam}
          </p>
          {match.awayScorers.length > 0 && (
            <div className="mt-1 space-y-0.5">
              {match.awayScorers.map((s, i) => (
                <p key={i} className="text-[10px] text-gray-400">
                  ⚽ {s}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Upcoming pill ─────────────────────────────────────────────────────────────
function UpcomingPill({ match }: { match: LiveMatch }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm">
      <span className="text-base">{match.homeFlag}</span>
      <span className="text-white/70 font-medium text-xs">
        {match.homeTeam}
      </span>
      <span className="flex flex-col items-center px-1">
        <span className="text-white text-xs font-bold">{match.wibTime}</span>
        <span className="text-gray-500 text-[10px]">{match.venueTime}</span>
      </span>
      <span className="text-white/70 font-medium text-xs">
        {match.awayTeam}
      </span>
      <span className="text-base">{match.awayFlag}</span>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function LiveMatchBanner() {
  const { live, today, isLoading } = useLiveMatches();

  const hasLive = live.length > 0;
  const hasToday = today.length > 0;

  if (isLoading && !hasLive && !hasToday) {
    return (
      <div className="h-12 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
    );
  }

  if (!hasLive && !hasToday) return null;

  return (
    <AnimatePresence>
      <motion.section
        key="live-banner"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-3"
      >
        {/* Live matches */}
        {hasLive && (
          <div className="space-y-2">
            <h3 className="font-display text-xs font-bold text-wc-red tracking-widest uppercase flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wc-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-wc-red" />
              </span>
              Live Now
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {live.map((m) => (
                <LiveCard key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}

        {/* Today's upcoming */}
        {hasToday && (
          <div className="space-y-2">
            <h3 className="font-display text-xs font-bold text-gray-400 tracking-widest uppercase">
              Today&apos;s Matches
            </h3>
            <div className="flex flex-wrap gap-2">
              {today.map((m) => (
                <UpcomingPill key={m.id} match={m} />
              ))}
            </div>
          </div>
        )}
      </motion.section>
    </AnimatePresence>
  );
}
