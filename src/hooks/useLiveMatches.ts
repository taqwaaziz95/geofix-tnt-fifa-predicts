import useSWR from "swr";
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

/** Polls /api/live-matches every 5 min normally, 30 s when a game is live. */
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
