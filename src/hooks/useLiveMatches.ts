import useSWR from "swr";
import { useEffect, useRef } from "react";
import type { LiveMatch } from "@/app/api/live-matches/route";

export type { LiveMatch };

interface LiveMatchesResponse {
  live: LiveMatch[];
  today: LiveMatch[];
  recentR16: LiveMatch[];
  r32Results: LiveMatch[];
  r16AllFinished: boolean;
  qfMatches: LiveMatch[];
  sfMatches: LiveMatch[];
  finalMatches: LiveMatch[];
  allByApiId: Record<string, LiveMatch>;
  fetchedAt: string;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("Failed to fetch live matches");
    return r.json() as Promise<LiveMatchesResponse>;
  });

/** Polls /api/live-matches every 5 min normally, 30 s when a game is live.
 *  Automatically calls /api/score-matches whenever new finished matches are
 *  detected (compares against a session-level count stored in sessionStorage).
 */
export function useLiveMatches() {
  const { data, error, isLoading } = useSWR<LiveMatchesResponse>(
    "/api/live-matches",
    fetcher,
    {
      refreshInterval: (data) =>
        data?.live && data.live.length > 0
          ? 30_000 // 30 s when live
          : 5 * 60_000, // 5 min otherwise
      revalidateOnFocus: false,
      dedupingInterval: 20_000,
    },
  );

  // Auto-trigger scoring when finished knockout matches are detected.
  // Uses localStorage so it persists across tabs:
  //   - Always fires when finishedCount increases.
  //   - Also fires if >5 min have elapsed since last score (catch-up for new matches).
  const scoringRef = useRef(false);
  const SCORE_INTERVAL_MS = 5 * 60 * 1000;
  useEffect(() => {
    if (!data || scoringRef.current) return;

    const allByApiId = data.allByApiId ?? {};
    const finishedCount = Object.values(allByApiId).filter(
      (m) => m.status === "finished" && parseInt(m.id) >= 89,
    ).length;
    if (finishedCount === 0) return;

    const triggerScore = () => {
      scoringRef.current = true;
      fetch("/api/score-matches", { method: "POST" })
        .then((r) => r.json())
        .then((result) => console.log("[score-matches]", result))
        .catch((e) => console.warn("[score-matches] failed:", e))
        .finally(() => {
          scoringRef.current = false;
        });
    };

    try {
      const cachedCount = parseInt(
        localStorage.getItem("scored_ko_count") ?? "0",
        10,
      );
      const lastTs = parseInt(localStorage.getItem("last_score_ts") ?? "0", 10);
      const elapsed = Date.now() - lastTs;
      if (finishedCount <= cachedCount && elapsed < SCORE_INTERVAL_MS) return;

      localStorage.setItem("scored_ko_count", String(finishedCount));
      localStorage.setItem("last_score_ts", String(Date.now()));
      triggerScore();
    } catch {
      // localStorage unavailable — always score
      triggerScore();
    }
  }, [data]);

  return {
    live: data?.live ?? [],
    today: data?.today ?? [],
    recentR16: data?.recentR16 ?? [],
    r32Results: data?.r32Results ?? [],
    r16AllFinished: data?.r16AllFinished ?? false,
    qfMatches: data?.qfMatches ?? [],
    sfMatches: data?.sfMatches ?? [],
    finalMatches: data?.finalMatches ?? [],
    allByApiId: data?.allByApiId ?? {},
    fetchedAt: data?.fetchedAt ?? null,
    isLoading,
    isError: !!error,
  };
}
