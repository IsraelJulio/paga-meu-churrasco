export type UserRole = "User" | "Admin";

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

export type MatchStatus = "Scheduled" | "Live" | "Finished" | "Canceled";
export type MatchPhase =
  | "GroupStage"
  | "RoundOf16"
  | "QuarterFinal"
  | "SemiFinal"
  | "Final";

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  Scheduled: "Agendado",
  Live: "Ao Vivo",
  Finished: "Encerrado",
  Canceled: "Cancelado",
};

export const MATCH_PHASE_LABELS: Record<MatchPhase, string> = {
  GroupStage: "Fase de Grupos",
  RoundOf16: "Oitavas",
  QuarterFinal: "Quartas",
  SemiFinal: "Semifinal",
  Final: "Final",
};

// Pool types
export type PoolStatus = "Active" | "Finished" | "Archived";
export type PoolParticipantRole = "Owner" | "Member";

export const POOL_STATUS_LABELS: Record<PoolStatus, string> = {
  Active: "Ativo",
  Finished: "Encerrado",
  Archived: "Arquivado",
};

// Badge condition keys
export type BadgeCondition =
  | "FIRST_CORRECT_RESULT"
  | "FIRST_EXACT_SCORE"
  | "FIVE_EXACT_SCORES"
  | "TEN_EXACT_SCORES"
  | "FIVE_CORRECT_RESULTS_STREAK"
  | "TEN_CORRECT_RESULTS_STREAK"
  | "FIRST_DOUBLE_PICK_HIT"
  | "THREE_DOUBLE_PICK_HITS"
  | "ROUND_WINNER"
  | "FIRST_TIME_LEADER";

// Scoring constants (can evolve to pool-level config)
export const DEFAULT_SCORING = {
  correctResultPoints: 3,
  goalDifferencePoints: 2,
  totalGoalsPoints: 2,
  exactScorePoints: 10,
  doubleMultiplier: 2,
} as const;

export interface ScoringSettings {
  correctResultPoints: number;
  goalDifferencePoints: number;
  totalGoalsPoints: number;
  exactScorePoints: number;
  doubleMultiplier: number;
}

export interface ScoreBreakdown {
  resultPoints: number;
  goalDifferencePoints: number;
  totalGoalsPoints: number;
  exactScorePoints: number;
  doubleMultiplier: number;
  totalPoints: number;
  explanation: string;
  isCorrectResult: boolean;
  isExactScore: boolean;
  isDouble: boolean;
}
