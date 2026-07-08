/**
 * Pre-locked R32 & R16 predictions submitted by existing players.
 * These predictions are LOCKED — users cannot edit them.
 * New users who join after this date can still make their own predictions.
 *
 * R32 Match IDs (from the original Excel spreadsheet):
 *   r32-m73: South Africa vs Canada (FINISHED — Canada won)
 *   r32-m74: Germany vs Paraguay (FINISHED — Paraguay won, pens 3-4)
 *   r32-m75: Netherlands vs Morocco (FINISHED — Morocco won, pens 2-3)
 *   r32-m76: Brazil vs Japan (FINISHED — Brazil won)
 *   r32-m77: France vs Sweden (FINISHED — France won)
 *   r32-m78: Côte d'Ivoire vs Norway (FINISHED — Norway won)
 *   r32-m79: Mexico vs Ecuador (FINISHED — Mexico won)
 *   r32-m80: England vs Congo DR (FINISHED — England won)
 *   r32-m81: USA vs Bosnia (FINISHED — United States won)
 *   r32-m82: Belgium vs Senegal (FINISHED — Belgium won, ET 3-2)
 *   r32-m83: Portugal vs Croatia (FINISHED — Portugal won)
 *   r32-m84: Spain vs Austria (FINISHED — Spain won)
 *   r32-m85: Switzerland vs Algeria (FINISHED — Switzerland won)
 *   r32-m86: Argentina vs Cabo Verde (FINISHED — Argentina won, ET 3-2)
 *   r32-m87: Colombia vs Ghana (FINISHED — Colombia won)
 *   r32-m88: Australia vs Egypt (FINISHED — Egypt won, pens 2-4)
 *
 * R16 Match IDs:
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

// ── R32 Predictions (from original Excel spreadsheet) ────────────────────────
export const SEEDED_R32_PREDICTIONS: PlayerSeededPredictions[] = [
  {
    playerId: "febby",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Senegal" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "fathan",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Senegal" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "fakhri",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Belgium" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "naufal",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Belgium" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "ahade",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Morocco" },
      { matchId: "r32-m76", winner: "Japan" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Belgium" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Ghana" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "aldy",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Belgium" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "affaninho",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Morocco" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Belgium" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "aji",
    predictions: [
      { matchId: "r32-m73", winner: "South Africa" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Ecuador" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Senegal" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Ghana" },
      { matchId: "r32-m88", winner: "Australia" },
    ],
  },
  {
    playerId: "dausman",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m74", winner: "Germany" },
      { matchId: "r32-m75", winner: "Netherlands" },
      { matchId: "r32-m76", winner: "Brazil" },
      { matchId: "r32-m77", winner: "France" },
      { matchId: "r32-m78", winner: "Norway" },
      { matchId: "r32-m79", winner: "Mexico" },
      { matchId: "r32-m80", winner: "England" },
      { matchId: "r32-m81", winner: "United States" },
      { matchId: "r32-m82", winner: "Senegal" },
      { matchId: "r32-m83", winner: "Portugal" },
      { matchId: "r32-m84", winner: "Spain" },
      { matchId: "r32-m85", winner: "Switzerland" },
      { matchId: "r32-m86", winner: "Argentina" },
      { matchId: "r32-m87", winner: "Colombia" },
      { matchId: "r32-m88", winner: "Egypt" },
    ],
  },
  {
    playerId: "wawa",
    predictions: [
      { matchId: "r32-m73", winner: "Canada" },
      { matchId: "r32-m76", winner: "Brazil" },
    ],
  },
];

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
 * Includes both R32 and R16 predictions.
 */
export function getSeededPredictionsForPlayer(
  playerId: string,
): Record<string, string> {
  const map: Record<string, string> = {};

  // R32 predictions
  const r32Data = SEEDED_R32_PREDICTIONS.find((p) => p.playerId === playerId);
  if (r32Data) {
    r32Data.predictions.forEach((pred) => {
      map[pred.matchId] = pred.winner;
    });
  }

  // R16 predictions
  const r16Data = SEEDED_R16_PREDICTIONS.find((p) => p.playerId === playerId);
  if (r16Data) {
    r16Data.predictions.forEach((pred) => {
      map[pred.matchId] = pred.winner;
    });
  }

  return map;
}

/**
 * Check if a playerId is an existing (pre-registered) player
 * whose predictions should be locked.
 */
export function isExistingLockedPlayer(playerId: string): boolean {
  return SEEDED_R16_PREDICTIONS.some((p) => p.playerId === playerId);
}
