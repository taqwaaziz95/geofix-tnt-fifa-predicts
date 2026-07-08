/**
 * seed-r32-predictions.cjs
 *
 * Seeds all existing players' R32 predictions into Firestore.
 * Data sourced from the original Excel prediction spreadsheet.
 * Writes to: predictions/{uid}/matches/{matchId}
 *
 * Usage:
 *   1. Ensure scripts/serviceAccountKey.json exists
 *   2. node scripts/seed-r32-predictions.cjs
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

// ── R32 Predictions Data (from original Excel spreadsheet) ───────────────────
// Match results for reference:
//   r32-m73: South Africa 0-1 Canada       → Canada won
//   r32-m74: Germany 1-1 Paraguay (3-4p)   → Paraguay won
//   r32-m75: Netherlands 1-1 Morocco (2-3p)→ Morocco won
//   r32-m76: Brazil 2-1 Japan              → Brazil won
//   r32-m77: France 3-0 Sweden             → France won
//   r32-m78: Côte d'Ivoire 1-2 Norway      → Norway won
//   r32-m79: Mexico 2-0 Ecuador            → Mexico won
//   r32-m80: England 2-1 Congo DR          → England won
//   r32-m81: USA 2-0 Bosnia                → United States won
//   r32-m82: Belgium 3-2 Senegal (ET)      → Belgium won
//   r32-m83: Portugal 2-1 Croatia          → Portugal won
//   r32-m84: Spain 3-0 Austria             → Spain won
//   r32-m85: Switzerland 2-0 Algeria       → Switzerland won
//   r32-m86: Argentina 3-2 Cabo Verde (ET) → Argentina won
//   r32-m87: Colombia 1-0 Ghana            → Colombia won
//   r32-m88: Australia 1-1 Egypt (2-4p)    → Egypt won

const PLAYER_PREDICTIONS = [
  {
    username: "febby",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Senegal",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "fathan",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Senegal",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "abil",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Belgium",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "aiman",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Belgium",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "ahade",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Morocco",
      "r32-m76": "Japan",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Belgium",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Ghana",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "riefaldy",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Belgium",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "affan",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Morocco",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Belgium",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "ajibray",
    picks: {
      "r32-m73": "South Africa",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Ecuador",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Senegal",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Ghana",
      "r32-m88": "Australia",
    },
  },
  {
    username: "dausman",
    picks: {
      "r32-m73": "Canada",
      "r32-m74": "Germany",
      "r32-m75": "Netherlands",
      "r32-m76": "Brazil",
      "r32-m77": "France",
      "r32-m78": "Norway",
      "r32-m79": "Mexico",
      "r32-m80": "England",
      "r32-m81": "United States",
      "r32-m82": "Senegal",
      "r32-m83": "Portugal",
      "r32-m84": "Spain",
      "r32-m85": "Switzerland",
      "r32-m86": "Argentina",
      "r32-m87": "Colombia",
      "r32-m88": "Egypt",
    },
  },
  {
    username: "wawa",
    picks: {
      "r32-m73": "Canada",
      "r32-m76": "Brazil",
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
      seeded: true, // flag to indicate this was seeded from Excel
    });
  }

  await batch.commit();

  console.log(
    `  ✅  ${player.username.padEnd(10)} → ${matchIds.length} R32 predictions seeded (uid: ${uid.slice(0, 10)}...)`,
  );
  return true;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n⚽  FIFA WC2026 — Seed R32 Predictions");
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
  console.log("\n🔒  R32 predictions are now seeded in Firestore.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
