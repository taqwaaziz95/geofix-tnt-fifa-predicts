/**
 * Maps usernames to Firebase Auth email format.
 * We use the pattern: username@wc2026.local
 * This keeps logins simple (just type your username).
 */
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@wc2026.local`;
}

export function emailToUsername(email: string): string {
  return email.replace("@wc2026.local", "");
}

// Pre-defined player roster — username maps to display name + avatar
export const PLAYER_ROSTER: Record<
  string,
  { displayName: string; avatar: string; playerId: string }
> = {
  aiman: {
    displayName: "Muhammad Naufal Aiman",
    avatar: "👑",
    playerId: "naufal",
  },
  riefaldy: { displayName: "Riefaldy", avatar: "⚡", playerId: "aldy" },
  febby: {
    displayName: "Febby Yudhi Pratama",
    avatar: "🦅",
    playerId: "febby",
  },
  fathan: { displayName: "Fathan Mauludin", avatar: "🌟", playerId: "fathan" },
  affan: { displayName: "Affaninho", avatar: "🔥", playerId: "affaninho" },
  abil: { displayName: "M Fakhri Auladana", avatar: "⚽", playerId: "fakhri" },
  ahade: { displayName: "Ahade", avatar: "🏆", playerId: "ahade" },
  dausman: { displayName: "Dausman", avatar: "💎", playerId: "dausman" },
  ajibray: { displayName: "Aji Bray", avatar: "🎯", playerId: "aji" },
  wawa: { displayName: "Wawa", avatar: "🌊", playerId: "wawa" },
};
