import { NextResponse } from "next/server";

const API_URL = "https://worldcup26.ir/get/games";

// Parse PostgreSQL-style array literals: {"Goal Scorer 31'","Other 45'"}
function parseScorers(raw: string | null | undefined): string[] {
  if (!raw || raw === "null" || raw === "{}") return [];
  return raw
    .replace(/^\{|\}$/g, "")
    .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
    .map((s) => s.replace(/^"|"$/g, "").trim())
    .filter(Boolean);
}

// Map English team name → flag emoji
const FLAG_MAP: Record<string, string> = {
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Mexico: "🇲🇽",
  Canada: "🇨🇦",
  Argentina: "🇦🇷",
  Brazil: "🇧🇷",
  Colombia: "🇨🇴",
  Uruguay: "🇺🇾",
  Ecuador: "🇪🇨",
  Chile: "🇨🇱",
  Venezuela: "🇻🇪",
  Paraguay: "🇵🇾",
  Peru: "🇵🇪",
  Bolivia: "🇧🇴",
  Spain: "🇪🇸",
  France: "🇫🇷",
  Germany: "🇩🇪",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Portugal: "🇵🇹",
  Netherlands: "🇳🇱",
  Italy: "🇮🇹",
  Belgium: "🇧🇪",
  Switzerland: "🇨🇭",
  Croatia: "🇭🇷",
  Denmark: "🇩🇰",
  Austria: "🇦🇹",
  Poland: "🇵🇱",
  Serbia: "🇷🇸",
  Ukraine: "🇺🇦",
  Hungary: "🇭🇺",
  Romania: "🇷🇴",
  "Czech Republic": "🇨🇿",
  Czechia: "🇨🇿",
  Slovakia: "🇸🇰",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Turkey: "🇹🇷",
  Greece: "🇬🇷",
  Norway: "🇳🇴",
  Sweden: "🇸🇪",
  Finland: "🇫🇮",
  Morocco: "🇲🇦",
  Senegal: "🇸🇳",
  Nigeria: "🇳🇬",
  Egypt: "🇪🇬",
  "Ivory Coast": "🇨🇮",
  "Côte d'Ivoire": "🇨🇮",
  Cameroon: "🇨🇲",
  Ghana: "🇬🇭",
  Tunisia: "🇹🇳",
  Algeria: "🇩🇿",
  Mali: "🇲🇱",
  "South Africa": "🇿🇦",
  Tanzania: "🇹🇿",
  Benin: "🇧🇯",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  "Korea Republic": "🇰🇷",
  Australia: "🇦🇺",
  Iran: "🇮🇷",
  "Saudi Arabia": "🇸🇦",
  Qatar: "🇶🇦",
  China: "🇨🇳",
  Indonesia: "🇮🇩",
  Uzbekistan: "🇺🇿",
  "New Zealand": "🇳🇿",
  "United Arab Emirates": "🇦🇪",
  Iraq: "🇮🇶",
  Jordan: "🇯🇴",
};

function getFlag(name: string): string {
  return FLAG_MAP[name] ?? "🏳️";
}

export interface LiveMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeFlag: string;
  awayFlag: string;
  homeScore: number;
  awayScore: number;
  homeScorers: string[];
  awayScorers: string[];
  homePenaltyScore: number | null;
  awayPenaltyScore: number | null;
  stage: string;
  localDate: string;
  status: "live" | "finished" | "notstarted";
  matchMinute: string | null;
}

function mapMatch(m: Record<string, string>): LiveMatch {
  return {
    id: m.id,
    homeTeam: m.home_team_name_en,
    awayTeam: m.away_team_name_en,
    homeFlag: getFlag(m.home_team_name_en),
    awayFlag: getFlag(m.away_team_name_en),
    homeScore: parseInt(m.home_score) || 0,
    awayScore: parseInt(m.away_score) || 0,
    homeScorers: parseScorers(m.home_scorers),
    awayScorers: parseScorers(m.away_scorers),
    homePenaltyScore:
      m.home_penalty_score && m.home_penalty_score !== "null"
        ? parseInt(m.home_penalty_score)
        : null,
    awayPenaltyScore:
      m.away_penalty_score && m.away_penalty_score !== "null"
        ? parseInt(m.away_penalty_score)
        : null,
    stage: (m.group || m.type || "").toUpperCase(),
    localDate: m.local_date,
    status:
      m.time_elapsed === "live"
        ? "live"
        : m.finished === "TRUE"
          ? "finished"
          : "notstarted",
    matchMinute:
      m.match_minute && m.match_minute !== "null" ? m.match_minute : null,
  };
}

// Today's date string in API format: MM/DD/YYYY
function todayString(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; fifa-predict-app/1.0)",
      },
      next: { revalidate: 300 }, // Next.js cache: 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Upstream API error" },
        { status: 502 },
      );
    }

    const json = await res.json();
    // API returns { games: [...] } or a plain array
    const raw: Record<string, string>[] = Array.isArray(json)
      ? json
      : (json.games ?? json.data ?? Object.values(json)[0] ?? []);
    const today = todayString();

    const live = raw.filter((m) => m.time_elapsed === "live").map(mapMatch);
    const todayMatches = raw
      .filter(
        (m) => m.local_date?.startsWith(today) && m.time_elapsed !== "live",
      )
      .map(mapMatch)
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    const finished = raw
      .filter((m) => m.finished === "TRUE" && m.time_elapsed !== "live")
      .map(mapMatch)
      .sort((a, b) => b.localDate.localeCompare(a.localDate)); // newest first

    const recentR16 = finished.filter((m) => m.stage === "R16");
    // Group stage = single letter A-L; R32 = knockout round of 32
    const r32Results = finished.filter(
      (m) => m.stage === "R32" || /^[A-L]$/.test(m.stage),
    );

    const r16AllFinished = recentR16.length >= 8;

    // QF / SF / Final matches with resolved team names
    const qfMatches = raw
      .filter((m) => m.group === "QF")
      .map(mapMatch)
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    const sfMatches = raw
      .filter((m) => m.group === "SF")
      .map(mapMatch)
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    const finalMatches = raw
      .filter((m) => m.group === "FINAL" || m.group === "3RD")
      .map(mapMatch)
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    // All knockout matches indexed by id for bracket merging
    const allByApiId: Record<string, (typeof qfMatches)[0]> = {};
    [...raw.map(mapMatch)].forEach((m) => {
      allByApiId[m.id] = m;
    });

    return NextResponse.json(
      {
        live,
        today: todayMatches,
        recentR16,
        r32Results,
        r16AllFinished,
        qfMatches,
        sfMatches,
        finalMatches,
        allByApiId,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch", detail: message },
      { status: 500 },
    );
  }
}
