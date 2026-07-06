/**
 * Pre-locked R16 predictions submitted by existing players on Sunday July 5.
 * These predictions are LOCKED — users cannot edit them.
 * New users who join after this date can still make their own predictions.
 *
 * Match IDs:
 *   r16-m89: Paraguay vs France (FINISHED)
 *   r16-m90: Canada vs Morocco (FINISHED)
 *   r16-m91: Brazil vs Norway (FINISHED)
 *   r16-m92: Mexico vs England (FINISHED)
 *   r16-m93: Portugal vs Spain (SCHEDULED)
 *   r16-m94: USA vs Belgium (SCHEDULED)
 *   r16-m95: Argentina vs Egypt (SCHEDULED)
 *   r16-m96: Switzerland vs Colombia (SCHEDULED)
 */

export interface SeededPrediction {
  matchId: string;
  winner: string;
}

export interface PlayerSeededPredictions {
  playerId: string;
  predictions: SeededPrediction[];
}

// The deadline after which existing users' predictions are locked
export const R16_LOCK_DATE = "2026-07-06T00:00:00Z"; // Sunday July 6 midnight UTC

// All existing players' locked predictions for R16 matches
export const SEEDED_R16_PREDICTIONS: PlayerSeededPredictions[] = [
  {
    playerId: "febby",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Spain" },
      { matchId: "r16-m94", winner: "United States" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "fathan",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Portugal" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Switzerland" },
    ],
  },
  {
    playerId: "fakhri",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Spain" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Switzerland" },
    ],
  },
  {
    playerId: "naufal",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Spain" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "ahade",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Portugal" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Egypt" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "aldy",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "Mexico" },
      { matchId: "r16-m93", winner: "Spain" },
      { matchId: "r16-m94", winner: "United States" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "affaninho",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Portugal" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "aji",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Spain" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "dausman",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Portugal" },
      { matchId: "r16-m94", winner: "United States" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
  {
    playerId: "wawa",
    predictions: [
      { matchId: "r16-m89", winner: "France" },
      { matchId: "r16-m90", winner: "Morocco" },
      { matchId: "r16-m91", winner: "Brazil" },
      { matchId: "r16-m92", winner: "England" },
      { matchId: "r16-m93", winner: "Portugal" },
      { matchId: "r16-m94", winner: "Belgium" },
      { matchId: "r16-m95", winner: "Argentina" },
      { matchId: "r16-m96", winner: "Colombia" },
    ],
  },
];

/**
 * Get a specific player's seeded predictions as a map of matchId -> winner
 */
export function getSeededPredictionsForPlayer(
  playerId: string,
): Record<string, string> {
  const playerData = SEEDED_R16_PREDICTIONS.find(
    (p) => p.playerId === playerId,
  );
  if (!playerData) return {};
  const map: Record<string, string> = {};
  playerData.predictions.forEach((pred) => {
    map[pred.matchId] = pred.winner;
  });
  return map;
}

/**
 * Check if a playerId is an existing (pre-registered) player
 * whose predictions should be locked.
 */
export function isExistingLockedPlayer(playerId: string): boolean {
  return SEEDED_R16_PREDICTIONS.some((p) => p.playerId === playerId);
}
