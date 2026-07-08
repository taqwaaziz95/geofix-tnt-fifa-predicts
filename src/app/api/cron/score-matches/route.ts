/**
 * POST /api/cron/score-matches
 *
 * Secured cron endpoint for cron-job.org (or any external scheduler).
 * Validates the Authorization header against CRON_SECRET before running scoring.
 *
 * cron-job.org setup:
 *   URL:    https://<your-domain>/api/cron/score-matches
 *   Method: POST
 *   Header: Authorization: Bearer <CRON_SECRET>
 *
 * Recommended schedule:
 *   - Every 5 min during tournament days  (star/5 * * * *)
 *   - Every 2 min when matches are live   (add a second job with tighter schedule)
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { SEEDED_R16_PREDICTIONS } from "@/data/seeded-predictions";
import {
  R16_MATCHES,
  QF_MATCHES,
  SF_MATCHES,
  FINAL_MATCHES,
} from "@/data/matches";

const GAMES_API = "https://worldcup26.ir/get/games";

const STAGE_PTS: Record<string, number> = {
  r16: 4,
  qf: 8,
  sf: 16,
  final: 20,
  "third-place": 8,
};

const STAGE_FIELD: Record<string, string> = {
  r16: "r16Points",
  qf: "qfPoints",
  sf: "sfPoints",
  final: "finalPoints",
  "third-place": "finalPoints",
};

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

function stagePrefix(staticId: string): string | null {
  for (const prefix of Object.keys(STAGE_PTS)) {
    if (staticId.startsWith(prefix + "-")) return prefix;
  }
  return null;
}

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
  return null;
}

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

export async function POST(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("[cron/score-matches] CRON_SECRET env var is not set");
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── Scoring logic (same as /api/score-matches) ────────────────────────────
  try {
    const db = adminDb();
    const apiToStatic = buildApiToStaticMap();
    const seededPreds = buildSeededMap();

    const res = await fetch(GAMES_API, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; fifa-predict-app/1.0)",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Upstream API error: ${res.status}`);

    const json = await res.json();
    const raw: Record<string, string>[] = Array.isArray(json)
      ? json
      : (json.games ?? []);

    const finishedKO = raw.filter(
      (m) => m.finished === "TRUE" && apiToStatic[m.id] !== undefined,
    );

    const usersSnap = await db.collection("users").get();
    if (usersSnap.empty) {
      return NextResponse.json({ ok: true, message: "No users found" });
    }

    const summary: Record<string, object> = {};

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

        let predicted: string | null = null;

        if (prefix === "r16" && seededPreds[playerId]) {
          predicted = seededPreds[playerId][staticId] ?? null;
        }

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

    console.log(
      `[cron/score-matches] Scored ${finishedKO.length} matches for ${usersSnap.size} users`,
    );

    return NextResponse.json({
      ok: true,
      matchesScored: finishedKO.length,
      usersUpdated: usersSnap.size,
      summary,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[cron/score-matches]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
