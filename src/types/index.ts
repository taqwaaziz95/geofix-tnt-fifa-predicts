export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
  group?: string;
}

export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED";
export type MatchStage =
  | "GROUP"
  | "R32"
  | "R16"
  | "QF"
  | "SF"
  | "FINAL"
  | "THIRD";

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  homePenalties?: number;
  awayPenalties?: number;
  extraTime?: boolean;
  date: string; // ISO string
  status: MatchStatus;
  stage: MatchStage;
  venue?: string;
  label?: string;
}

export interface Prediction {
  matchId: string;
  winner: string; // team name
  submittedAt: string;
}

export interface PlayerPredictions {
  [matchId: string]: Prediction;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  groupPoints: number;
  knockoutPoints: number;
  totalPoints: number;
  correctPredictions: number;
  r32Points: number;
  r16Points: number;
  qfPoints: number;
  sfPoints: number;
  finalPoints: number;
}

export interface LeaderboardEntry extends Player {
  rank: number;
  previousRank?: number;
}

export interface PointEvent {
  playerId: string;
  matchId: string;
  points: number;
  correct: boolean;
  stage: MatchStage;
}

export interface ScoringRules {
  r32Winner: number;
  r16Winner: number;
  qfWinner: number;
  sfWinner: number;
  finalRunnerUp: number;
  championBonus: number;
  thirdPlaceWinner: number;
}

export const SCORING_RULES: ScoringRules = {
  r32Winner: 2,
  r16Winner: 4,
  qfWinner: 8,
  sfWinner: 16,
  finalRunnerUp: 16,
  championBonus: 20,
  thirdPlaceWinner: 8,
};
