/**
 * seed-single-user.cjs
 *
 * Seeds a single manually-added Firebase Auth user into Firestore.
 * Use this when you've added a user via Firebase Console but they can't log in
 * because they're missing a Firestore `users/{uid}` document.
 *
 * Usage:
 *   node scripts/seed-single-user.cjs
 */

"use strict";

const fs = require("fs");
const path = require("path");
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

// ═══════════════════════════════════════════════════════════════════════════════
// ▼▼▼  CONFIGURE THIS USER BELOW  ▼▼▼
// ═══════════════════════════════════════════════════════════════════════════════

const USERNAME = "uchupis";
const DISPLAY_NAME = "Ucups";
const AVATAR = "🆕";
const PASSWORD = "qweqweqwe";
const EMAIL_DOMAIN = "@wc2026.local";

// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const email = `${USERNAME}${EMAIL_DOMAIN}`;

  console.log(`\n⚽  Seeding single user: ${USERNAME}`);
  console.log(`   Email: ${email}`);
  console.log(`   Project: ${serviceAccount.project_id}\n`);

  // Get or verify user in Firebase Auth
  let uid;
  try {
    const existing = await auth.getUserByEmail(email);
    uid = existing.uid;
    console.log(`  ✅  Found in Auth (uid: ${uid.slice(0, 12)}...)`);

    // Ensure password is correct
    await auth.updateUser(uid, {
      password: PASSWORD,
      displayName: DISPLAY_NAME,
    });
    console.log(`  ✅  Password & displayName updated`);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      console.log(`  ⚠️  User not in Auth — creating...`);
      const created = await auth.createUser({
        email,
        password: PASSWORD,
        displayName: DISPLAY_NAME,
      });
      uid = created.uid;
      console.log(`  ✅  Created in Auth (uid: ${uid.slice(0, 12)}...)`);
    } else {
      throw err;
    }
  }

  // Create/update Firestore user document
  await db.collection("users").doc(uid).set(
    {
      uid,
      username: USERNAME,
      displayName: DISPLAY_NAME,
      avatar: AVATAR,
      playerId: USERNAME,
      groupPoints: 0,
      knockoutPoints: 0,
      totalPoints: 0,
      correctPredictions: 0,
      r32Points: 0,
      r16Points: 0,
      qfPoints: 0,
      sfPoints: 0,
      finalPoints: 0,
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  console.log(`  ✅  Firestore document created/updated`);
  console.log(`\n🚀  Done! Login credentials:`);
  console.log(`   Username: ${USERNAME}`);
  console.log(`   Password: ${PASSWORD}\n`);
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
