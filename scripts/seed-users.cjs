/**
 * seed-users.cjs
 *
 * Creates Firebase Auth accounts + Firestore documents for all 10 players.
 * Uses firebase-admin v12 modular API.
 *
 * Usage:
 *   1. Firebase Console → Project Settings → Service Accounts
 *      → "Generate new private key" → save as  scripts/serviceAccountKey.json
 *   2. node scripts/seed-users.cjs
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

// ── Player roster (from Excel workbook) ──────────────────────────────────────
const PASSWORD = "qweqweqwe";
const EMAIL_DOMAIN = "@wc2026.local";

const PLAYERS = [
  {
    username: "aiman",
    displayName: "Muhammad Naufal Aiman",
    avatar: "👑",
    playerId: "naufal",
    groupPoints: 113,
    knockoutPoints: 40,
    totalPoints: 153,
    correctPredictions: 40,
    r32Points: 28,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "riefaldy",
    displayName: "Riefaldy",
    avatar: "⚡",
    playerId: "aldy",
    groupPoints: 108,
    knockoutPoints: 36,
    totalPoints: 144,
    correctPredictions: 38,
    r32Points: 28,
    r16Points: 8,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "febby",
    displayName: "Febby Yudhi Pratama",
    avatar: "🦅",
    playerId: "febby",
    groupPoints: 105,
    knockoutPoints: 38,
    totalPoints: 143,
    correctPredictions: 37,
    r32Points: 26,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "fathan",
    displayName: "Fathan Mauludin",
    avatar: "🌟",
    playerId: "fathan",
    groupPoints: 94,
    knockoutPoints: 38,
    totalPoints: 132,
    correctPredictions: 35,
    r32Points: 26,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "affan",
    displayName: "Affaninho",
    avatar: "🔥",
    playerId: "affaninho",
    groupPoints: 84,
    knockoutPoints: 42,
    totalPoints: 126,
    correctPredictions: 34,
    r32Points: 30,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "abil",
    displayName: "M Fakhri Auladana",
    avatar: "⚽",
    playerId: "fakhri",
    groupPoints: 85,
    knockoutPoints: 40,
    totalPoints: 125,
    correctPredictions: 35,
    r32Points: 28,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "ahade",
    displayName: "Ahade",
    avatar: "🏆",
    playerId: "ahade",
    groupPoints: 84,
    knockoutPoints: 38,
    totalPoints: 122,
    correctPredictions: 33,
    r32Points: 26,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "dausman",
    displayName: "Dausman",
    avatar: "💎",
    playerId: "dausman",
    groupPoints: 0,
    knockoutPoints: 26,
    totalPoints: 26,
    correctPredictions: 13,
    r32Points: 26,
    r16Points: 0,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "ajibray",
    displayName: "Aji Bray",
    avatar: "🎯",
    playerId: "aji",
    groupPoints: 0,
    knockoutPoints: 18,
    totalPoints: 18,
    correctPredictions: 9,
    r32Points: 18,
    r16Points: 0,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
  {
    username: "wawa",
    displayName: "Wawa",
    avatar: "🌊",
    playerId: "wawa",
    groupPoints: 0,
    knockoutPoints: 12,
    totalPoints: 12,
    correctPredictions: 3,
    r32Points: 0,
    r16Points: 12,
    qfPoints: 0,
    sfPoints: 0,
    finalPoints: 0,
  },
];

// ── Create / update a single user ─────────────────────────────────────────────
async function upsertUser(player) {
  const email = `${player.username}${EMAIL_DOMAIN}`;
  let uid;

  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    // Update password to ensure it matches
    await auth.updateUser(uid, {
      password: PASSWORD,
      displayName: player.displayName,
    });
    console.log(
      `  ↩  ${player.username.padEnd(10)} already exists  (uid: ${uid.slice(0, 10)}...)`,
    );
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const created = await auth.createUser({
        email,
        password: PASSWORD,
        displayName: player.displayName,
      });
      uid = created.uid;
      console.log(
        `  ✅  ${player.username.padEnd(10)} created           (uid: ${uid.slice(0, 10)}...)`,
      );
    } else {
      throw err;
    }
  }

  // Upsert Firestore user document (merge: true keeps any extra fields)
  await db.collection("users").doc(uid).set(
    {
      uid,
      username: player.username,
      displayName: player.displayName,
      avatar: player.avatar,
      playerId: player.playerId,
      groupPoints: player.groupPoints,
      knockoutPoints: player.knockoutPoints,
      totalPoints: player.totalPoints,
      correctPredictions: player.correctPredictions,
      r32Points: player.r32Points,
      r16Points: player.r16Points,
      qfPoints: player.qfPoints,
      sfPoints: player.sfPoints,
      finalPoints: player.finalPoints,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  return uid;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\n🌍  FIFA WC2026 Predict — User Seeding Script");
  console.log(`   Project : ${serviceAccount.project_id}`);
  console.log(`   Email   : username${EMAIL_DOMAIN}`);
  console.log(`   Password: ${PASSWORD}\n`);

  let ok = 0,
    fail = 0;

  for (const player of PLAYERS) {
    try {
      await upsertUser(player);
      ok++;
    } catch (err) {
      console.error(`  ❌  ${player.username}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\n✨  Done! ${ok} seeded, ${fail} failed.\n`);
  console.log("Players & passwords:");
  PLAYERS.forEach((p) =>
    console.log(
      `  ${p.avatar}  ${p.username.padEnd(10)} / ${PASSWORD}  →  ${p.displayName}`,
    ),
  );
  console.log("\n🚀  Users can now log in at /login\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFatal error:", err.message);
  process.exit(1);
});
