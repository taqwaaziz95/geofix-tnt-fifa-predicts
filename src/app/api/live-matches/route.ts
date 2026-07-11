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
  venueTime: string; // e.g. "17:00 ET"
  wibTime: string;   // e.g. "04:00 WIB"
  status: "live" | "finished" | "notstarted";
  matchMinute: string | null;
}

// Determine if a match is truly live based on WIB time comparison.
// A match is live if: current WIB time >= kickoff WIB time AND not finished
// AND within 3 hours of kickoff (to account for extra time / penalties).
function isMatchLive(m: Record<string, string>): boolean {
  if (m.finished === "TRUE") return false;
  if (!m.local_date) return false;

  const [datePart, timePart] = m.local_date.split(" ");
  if (!datePart || !timePart) return false;
  const [mm, dd, yyyy] = datePart.split("/");
  const [hh, min] = timePart.split(":");

  const venueOffset =
    m.stadium_id && STADIUM_UTC_OFFSETS[m.stadium_id] !== undefined
      ? STADIUM_UTC_OFFSETS[m.stadium_id]
      : -4;

  // Convert venue local time to UTC timestamp
  const kickoffUTC = Date.UTC(
    parseInt(yyyy),
    parseInt(mm) - 1,
    parseInt(dd),
    parseInt(hh) - venueOffset,
    parseInt(min),
  );

  const now = Date.now();
  const threeHoursMs = 3 * 60 * 60 * 1000;

  return now >= kickoffUTC && now <= kickoffUTC + threeHoursMs;
}

function mapMatch(m: Record<string, string>): LiveMatch {
  const live = isMatchLive(m);
  const venueTimeRaw = m.local_date?.split(" ")[1] ?? "";
  const tzLabel = m.stadium_id && STADIUM_TZ_LABEL[m.stadium_id]
    ? STADIUM_TZ_LABEL[m.stadium_id]
    : "ET";
  const wibFull = toWIB(m.local_date, m.stadium_id);
  const wibTimeOnly = wibFull?.split(" ")[1] ?? "";

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
    localDate: wibFull,
    venueTime: `${venueTimeRaw} ${tzLabel}`,
    wibTime: `${wibTimeOnly} WIB`,
    status: live ? "live" : m.finished === "TRUE" ? "finished" : "notstarted",
    matchMinute:
      m.match_minute && m.match_minute !== "null" ? m.match_minute : null,
  };
}

// Stadium timezone offsets (UTC offset during DST / summer 2026)
// Index = stadium_id - 1 (API stadium_id is 1-based)
const STADIUM_UTC_OFFSETS: Record<string, number> = {
  "1": -7, // Vancouver – BC Place
  "2": -7, // Seattle – Lumen Field
  "3": -7, // San Francisco – Levi's Stadium
  "4": -7, // Los Angeles – SoFi Stadium
  "5": -6, // Guadalajara – Estadio Akron
  "6": -6, // Mexico City – Estadio Azteca
  "7": -6, // Monterrey – Estadio BBVA
  "8": -5, // Houston – NRG Stadium
  "9": -5, // Dallas – AT&T Stadium
  "10": -5, // Kansas City – Arrowhead Stadium
  "11": -4, // Atlanta – Mercedes-Benz Stadium
  "12": -4, // Miami – Hard Rock Stadium
  "13": -4, // Toronto – BMO Field
  "14": -4, // Boston – Gillette Stadium
  "15": -4, // Philadelphia – Lincoln Financial Field
  "16": -4, // New York/New Jersey – MetLife Stadium
};

// Timezone abbreviation labels (summer/DST)
const STADIUM_TZ_LABEL: Record<string, string> = {
  "1": "PT",  // Vancouver – Pacific
  "2": "PT",  // Seattle – Pacific
  "3": "PT",  // San Francisco – Pacific
  "4": "PT",  // Los Angeles – Pacific
  "5": "CT",  // Guadalajara – Central (Mexico)
  "6": "CT",  // Mexico City – Central (Mexico)
  "7": "CT",  // Monterrey – Central (Mexico)
  "8": "CT",  // Houston – Central
  "9": "CT",  // Dallas – Central
  "10": "CT", // Kansas City – Central
  "11": "ET", // Atlanta – Eastern
  "12": "ET", // Miami – Eastern
  "13": "ET", // Toronto – Eastern
  "14": "ET", // Boston – Eastern
  "15": "ET", // Philadelphia – Eastern
  "16": "ET", // New York/New Jersey – Eastern
};

// Convert "MM/DD/YYYY HH:MM" from venue local time to WIB (UTC+7)
// Uses stadium_id to determine the venue's UTC offset
function toWIB(localDate: string, stadiumId?: string): string {
  if (!localDate) return localDate;
  // Parse "MM/DD/YYYY HH:MM"
  const [datePart, timePart] = localDate.split(" ");
  if (!datePart || !timePart) return localDate;
  const [mm, dd, yyyy] = datePart.split("/");
  const [hh, min] = timePart.split(":");

  // Determine venue UTC offset (default to UTC-4 / Eastern if unknown)
  const venueOffset =
    stadiumId && STADIUM_UTC_OFFSETS[stadiumId] !== undefined
      ? STADIUM_UTC_OFFSETS[stadiumId]
      : -4;

  // Hours to add: from venue local → WIB = (7 - venueOffset)
  // e.g. UTC-4 (Eastern): 7 - (-4) = +11h
  // e.g. UTC-5 (Central): 7 - (-5) = +12h
  // e.g. UTC-6 (Mountain/Mexico): 7 - (-6) = +13h
  // e.g. UTC-7 (Pacific): 7 - (-7) = +14h
  const hoursToAdd = 7 - venueOffset;

  // Create a Date object treating the local_date as UTC for arithmetic
  const d = new Date(
    Date.UTC(
      parseInt(yyyy),
      parseInt(mm) - 1,
      parseInt(dd),
      parseInt(hh),
      parseInt(min),
    ),
  );
  // Shift by the offset to get WIB
  d.setUTCHours(d.getUTCHours() + hoursToAdd);

  // Format back as MM/DD/YYYY HH:MM
  const wibMM = String(d.getUTCMonth() + 1).padStart(2, "0");
  const wibDD = String(d.getUTCDate()).padStart(2, "0");
  const wibYYYY = d.getUTCFullYear();
  const wibHH = String(d.getUTCHours()).padStart(2, "0");
  const wibMin = String(d.getUTCMinutes()).padStart(2, "0");
  return `${wibMM}/${wibDD}/${wibYYYY} ${wibHH}:${wibMin}`;
}

// Today's date string in WIB (UTC+7) format: MM/DD/YYYY
function todayString(): string {
  const now = new Date();
  // Shift to WIB: add 7 hours to UTC
  const wib = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const mm = String(wib.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(wib.getUTCDate()).padStart(2, "0");
  const yyyy = wib.getUTCFullYear();
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

    const allMapped = raw.map(mapMatch);
    const live = allMapped.filter((m) => m.status === "live");
    const todayMatches = allMapped
      .filter(
        (m) => m.localDate?.startsWith(today) && m.status === "notstarted",
      )
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    const finished = allMapped
      .filter((m) => m.status === "finished")
      .sort((a, b) => b.localDate.localeCompare(a.localDate)); // newest first

    const recentR16 = finished.filter((m) => m.stage === "R16");
    // Group stage = single letter A-L; R32 = knockout round of 32
    const r32Results = finished.filter(
      (m) => m.stage === "R32" || /^[A-L]$/.test(m.stage),
    );

    const r16AllFinished = recentR16.length >= 8;

    // QF / SF / Final matches with resolved team names
    const qfMatches = allMapped
      .filter((m) => m.stage === "QF")
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    const sfMatches = allMapped
      .filter((m) => m.stage === "SF")
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    const finalMatches = allMapped
      .filter((m) => m.stage === "FINAL" || m.stage === "3RD")
      .sort((a, b) => a.localDate.localeCompare(b.localDate));

    // All knockout matches indexed by id for bracket merging
    const allByApiId: Record<string, (typeof qfMatches)[0]> = {};
    allMapped.forEach((m) => {
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
