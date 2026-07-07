/**
 * POST /api/score-matches
 *
 * Reads all finished knockout matches from the live API, computes correct
 * predictions for every player, and updates Firestore user documents.
 *
 * Safe to call multiple times — recomputes from scratch (idempotent).
 * Scoring scope: R16, QF, SF, Final / 3rd-place.
 * Group & R32 points are kept as-is from the seed (they predate the app).
 */
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { SEEDED_R16_PREDICTIONS } from "@/data/seeded-predictions";
import {
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";

const GAMES_API = "https://worldcup26.ir/get/games";

// Points per stage (keyed by static-ID prefix)
const STAGE_PTS: Record<string, number> = {
  r16: 4,
  qf: 8,
  sf: 16,
  final: 20,
  "third-place": 8,
};

// Static-ID prefix → Firestore field
const STAGE_FIELD: Record<string, string> = {
  r16: "r16Points",
  qf: "qfPoints",
  sf: "sfPoints",
  final: "finalPoints",
  "third-place": "finalPoints",
};

// Build map: apiNumericId → staticMatchId  ("89" → "r16-m89", "97" → "qf-m97", …)
function buildApiToStaticMap(): Record<string, string> {
  const map: Record<string, string> = {};
  [...R16_MATCHES, ...QF_MATCHES, ...SF_MATCHES, ...FINAL_MATCHES].forEach(
    (m) => {
      const num = m.id.match(/(\d+)$/)?.[1];
      if (num) map[num] = m.id;
    },
  );
  return map;
}

// Get the stage prefix from a static match ID ("r16-m89" → "r16", "third-place-m103" → "third-place")
function stagePrefix(staticId: string): string | null {
  for (const prefix of Object.keys(STAGE_PTS)) {
    if (staticId.startsWith(prefix + "-")) return prefix;
  }
  return null;
}

// Determine the winning team name from a raw API match record
function getWinner(m: Record<string, string>): string | null {
  if (m.finished !== "TRUE") return null;

  const home = parseInt(m.home_score) || 0;
  const away = parseInt(m.away_score) || 0;
  const homePens =
    m.home_penalty_score && m.home_penalty_score !== "null"
      ? parseInt(m.home_penalty_score)
      : null;
  const awayPens =
    m.away_penalty_score && m.away_penalty_score !== "null"
      ? parseInt(m.away_penalty_score)
      : null;

  if (homePens !== null && awayPens !== null) {
    return homePens > awayPens ? m.home_team_name_en : m.away_team_name_en;
  }
  if (home > away) return m.home_team_name_en;
  if (away > home) return m.away_team_name_en;
  return null; // draw (shouldn't happen in knockout)
}

// Build a flat map: playerId → { matchId → winner } from seeded R16 predictions
function buildSeededMap(): Record<string, Record<string, string>> {
  const map: Record<string, Record<string, string>> = {};
  for (const p of SEEDED_R16_PREDICTIONS) {
    map[p.playerId] = {};
    for (const pred of p.predictions) {
      map[p.playerId][pred.matchId] = pred.winner;
    }
  }
  return map;
}

export async function GET() {
  return score();
}

export async function POST() {
  return score();
}

async function score() {
  try {
    const db = adminDb();
    const apiToStatic = buildApiToStaticMap();
    const seededPreds = buildSeededMap();

    // ── Fetch all finished matches from API ───────────────────────────────────
    const res = await fetch(GAMES_API, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; fifa-predict-app/1.0)",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const json = await res.json();
    const raw: Record<string, string>[] = Array.isArray(json)
      ? json
      : (json.games ?? []);

    // Only finished matches that have a static ID in our knockout bracket
    const finishedKO = raw.filter(
      (m) => m.finished === "TRUE" && apiToStatic[m.id] !== undefined,
    );

    // ── Load all user documents from Firestore ────────────────────────────────
    const usersSnap = await db.collection("users").get();
    if (usersSnap.empty) {
      return NextResponse.json({ message: "No users found" }, { status: 200 });
    }

    const summary: Record<string, object> = {};

    // ── Score each user ───────────────────────────────────────────────────────
    const writes: Promise<void>[] = usersSnap.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const uid = userDoc.id;
      const playerId: string = userData.playerId ?? "";

      const earned: Record<string, number> = {
        r16Points: 0,
        qfPoints: 0,
        sfPoints: 0,
        finalPoints: 0,
      };

      for (const match of finishedKO) {
        const winner = getWinner(match);
        if (!winner) continue;

        const staticId = apiToStatic[match.id];
        const prefix = stagePrefix(staticId);
        if (!prefix) continue;

        const field = STAGE_FIELD[prefix];
        const pts = STAGE_PTS[prefix];

        // Find the user's prediction for this match
        let predicted: string | null = null;

        // R16: seeded locked players use the seeded file
        if (prefix === "r16" && seededPreds[playerId]) {
          predicted = seededPreds[playerId][staticId] ?? null;
        }

        // All stages: fall back to Firestore (new users + QF/SF/Final for everyone)
        if (!predicted) {
          try {
            const predDoc = await db
              .collection("predictions")
              .doc(uid)
              .collection("matches")
              .doc(staticId)
              .get();
            if (predDoc.exists) predicted = predDoc.data()?.winner ?? null;
          } catch {
            // ignore missing prediction
          }
        }

        if (predicted && predicted === winner) {
          earned[field] = (earned[field] ?? 0) + pts;
        }
      }

      const r32Points = userData.r32Points ?? 0;
      const groupPoints = userData.groupPoints ?? 0;
      const knockoutPoints =
        r32Points +
        earned.r16Points +
        earned.qfPoints +
        earned.sfPoints +
        earned.finalPoints;
      const totalPoints = groupPoints + knockoutPoints;

      summary[userData.username ?? uid] = {
        r16Points: earned.r16Points,
        qfPoints: earned.qfPoints,
        sfPoints: earned.sfPoints,
        finalPoints: earned.finalPoints,
        knockoutPoints,
        totalPoints,
      };

      await userDoc.ref.update({
        r16Points: earned.r16Points,
        qfPoints: earned.qfPoints,
        sfPoints: earned.sfPoints,
        finalPoints: earned.finalPoints,
        knockoutPoints,
        totalPoints,
      });
    });

    await Promise.all(writes);

    return NextResponse.json({
      ok: true,
      matchesScored: finishedKO.length,
      usersUpdated: usersSnap.size,
      summary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[score-matches]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
