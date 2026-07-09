/**
 * seed-qf-single-user.cjs
 *
 * Injects QF predictions for a single user directly by UID.
 * Writes to: predictions/{uid}/matches/{matchId}
 *
 * Usage:
 *   node scripts/seed-qf-single-user.cjs
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

// ── Load service account key ─────────────────────────────────────────────────
const keyPath = path.join(__dirname, "serviceAccountKey.json");
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
} catch {
  console.error("\n❌  serviceAccountKey.json not found!");
  console.error(`   Save the file as: ${keyPath}\n`);
  process.exit(1);
}

// ── Init ─────────────────────────────────────────────────────────────────────
initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore();

// ── Config ───────────────────────────────────────────────────────────────────
const TARGET_UID = "aFFSDzjFuFXCzWvNIHyhs3SDW5f2";

const QF_PICKS = {
  "qf-m97": "Morocco",
  "qf-m98": "Spain",
  "qf-m99": "Norway",
  "qf-m100": "Argentina",
};

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n⚽  FIFA WC2026 — Seed QF Predictions (Single User)");
  console.log(`   Project: ${serviceAccount.project_id}`);
  console.log(`   UID: ${TARGET_UID}`);
  console.log(`   Writing to: predictions/${TARGET_UID}/matches/{matchId}\n`);

  const batch = db.batch();
  const matchIds = Object.keys(QF_PICKS);

  for (const matchId of matchIds) {
    const predRef = db
      .collection("predictions")
      .doc(TARGET_UID)
      .collection("matches")
      .doc(matchId);

    batch.set(predRef, {
      matchId,
      winner: QF_PICKS[matchId],
      submittedAt: FieldValue.serverTimestamp(),
      seeded: true,
    });

    console.log(`  📝  ${matchId} → ${QF_PICKS[matchId]}`);
  }

  await batch.commit();

  console.log(
    `\n✅  Done! ${matchIds.length} QF predictions seeded for ${TARGET_UID}`,
  );
  console.log("🔒  Predictions are now in Firestore.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
