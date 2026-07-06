/**
 * seed-r16-predictions.cjs
 *
 * Seeds all existing players' R16 predictions into Firestore.
 * Writes to: predictions/{uid}/matches/{matchId}
 *
 * Usage:
 *   1. Ensure scripts/serviceAccountKey.json exists
 *   2. node scripts/seed-r16-predictions.cjs
 *
 * This is idempotent — safe to run multiple times. It will overwrite existing predictions.
 */

"use strict";

const fs = require("fs");
const path = require("path");

// ── firebase-admin v12 modular API ───────────────────────────────────────────
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// ── Load service account key ─────────────────────────────────────────────────
const keyPath = path.join(__dirname, "serviceAccountKey.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
} catch {
  console.error("\n❌  serviceAccountKey.json not found!");
  console.error("   Download it from:");
  console.error(
    "   Firebase Console → Project Settings → Service Accounts → Generate new private key",
  );
  console.error(`   Save the file as: ${keyPath}\n`);
  process.exit(1);
}

// ── Init ─────────────────────────────────────────────────────────────────────
initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const auth = getAuth();
const db = getFirestore();

// ── Email config ─────────────────────────────────────────────────────────────
const EMAIL_DOMAIN = "@wc2026.local";

// ── R16 Predictions Data (from Excel spreadsheet, locked Sunday Jul 5) ───────
// Match IDs reference the matches in src/data/matches.ts:
//   r16-m89: Paraguay vs France        (FINISHED — France won)
//   r16-m90: Canada vs Morocco          (FINISHED — Morocco won)
//   r16-m91: Brazil vs Norway           (FINISHED — Norway won)
//   r16-m92: Mexico vs England          (FINISHED — England won)
//   r16-m93: Portugal vs Spain          (SCHEDULED)
//   r16-m94: USA vs Belgium             (SCHEDULED)
//   r16-m95: Argentina vs Egypt         (SCHEDULED)
//   r16-m96: Switzerland vs Colombia    (SCHEDULED)

const PLAYER_PREDICTIONS = [
  {
    username: "febby",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Spain",
      "r16-m94": "United States",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "fathan",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Portugal",
      "r16-m94": "Belgium",
      "r16-m95": "Argentina",
      "r16-m96": "Switzerland",
    },
  },
  {
    username: "abil",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Spain",
      "r16-m94": "Belgium",
      "r16-m95": "Argentina",
      "r16-m96": "Switzerland",
    },
  },
  {
    username: "aiman",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Spain",
      "r16-m94": "Belgium",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "ahade",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Portugal",
      "r16-m94": "Belgium",
      "r16-m95": "Egypt",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "riefaldy",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "Mexico",
      "r16-m93": "Spain",
      "r16-m94": "United States",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "affan",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Portugal",
      "r16-m94": "Belgium",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "ajibray",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Spain",
      "r16-m94": "Belgium",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "dausman",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Portugal",
      "r16-m94": "United States",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
  {
    username: "wawa",
    picks: {
      "r16-m89": "France",
      "r16-m90": "Morocco",
      "r16-m91": "Brazil",
      "r16-m92": "England",
      "r16-m93": "Portugal",
      "r16-m94": "Belgium",
      "r16-m95": "Argentina",
      "r16-m96": "Colombia",
    },
  },
];

// ── Seed predictions for a single player ─────────────────────────────────────
async function seedPlayerPredictions(player) {
  const email = `${player.username}${EMAIL_DOMAIN}`;

  // Look up user UID from Firebase Auth
  let uid;
  try {
    const userRecord = await auth.getUserByEmail(email);
    uid = userRecord.uid;
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.error(
        `  ⚠️  ${player.username} — user not found in Auth, skipping`,
      );
      return false;
    }
    throw err;
  }

  // Write each prediction to Firestore: predictions/{uid}/matches/{matchId}
  const batch = db.batch();
  const matchIds = Object.keys(player.picks);

  for (const matchId of matchIds) {
    const predRef = db
      .collection("predictions")
      .doc(uid)
      .collection("matches")
      .doc(matchId);

    batch.set(predRef, {
      matchId,
      winner: player.picks[matchId],
      submittedAt: FieldValue.serverTimestamp(),
      seeded: true, // flag to indicate this was seeded, not user-submitted
    });
  }

  await batch.commit();

  console.log(
    `  ✅  ${player.username.padEnd(10)} → ${matchIds.length} predictions seeded (uid: ${uid.slice(0, 10)}...)`,
  );
  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n⚽  FIFA WC2026 — Seed R16 Predictions");
  console.log(`   Project: ${serviceAccount.project_id}`);
  console.log(`   Writing to: predictions/{uid}/matches/{matchId}`);
  console.log(`   Players: ${PLAYER_PREDICTIONS.length}\n`);

  let ok = 0;
  let fail = 0;

  for (const player of PLAYER_PREDICTIONS) {
    try {
      const success = await seedPlayerPredictions(player);
      if (success) ok++;
      else fail++;
    } catch (err) {
      console.error(`  ❌  ${player.username}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✨  Done! ${ok} players seeded, ${fail} failed.`);
  console.log("\nPredictions summary:");
  console.log("─".repeat(80));
  console.log(
    "  Player".padEnd(14) +
      "M89".padEnd(8) +
      "M90".padEnd(9) +
      "M91".padEnd(8) +
      "M92".padEnd(10) +
      "M93".padEnd(10) +
      "M94".padEnd(8) +
      "M95".padEnd(11) +
      "M96",
  );
  console.log("─".repeat(80));
  for (const p of PLAYER_PREDICTIONS) {
    const picks = p.picks;
    console.log(
      `  ${p.username.padEnd(12)}` +
        `${picks["r16-m89"].padEnd(8)}` +
        `${picks["r16-m90"].padEnd(9)}` +
        `${picks["r16-m91"].padEnd(8)}` +
        `${picks["r16-m92"].padEnd(10)}` +
        `${picks["r16-m93"].padEnd(10)}` +
        `${picks["r16-m94"].padEnd(8)}` +
        `${picks["r16-m95"].padEnd(11)}` +
        `${picks["r16-m96"]}`,
    );
  }
  console.log("─".repeat(80));
  console.log("\n🔒  These predictions are now locked in Firestore.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
