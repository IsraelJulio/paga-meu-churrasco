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
