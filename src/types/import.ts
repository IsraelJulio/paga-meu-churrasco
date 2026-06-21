export type ImportEntityType =
  | "teams"
  | "players"
  | "groups"
  | "matches"
  | "stadiums"
  | "badges";

export type ImportBatchStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "CompletedWithErrors"
  | "Failed";

export type ImportFileStatus = "Pending" | "Processing" | "Completed" | "Failed";

export const IMPORT_ENTITY_LABELS: Record<ImportEntityType, string> = {
  teams: "Seleções",
  players: "Jogadores",
  groups: "Grupos",
  matches: "Partidas",
  stadiums: "Estádios",
  badges: "Conquistas",
};

export const IMPORT_BATCH_STATUS_LABELS: Record<ImportBatchStatus, string> = {
  Pending: "Pendente",
  Processing: "Processando",
  Completed: "Concluído",
  CompletedWithErrors: "Concluído com erros",
  Failed: "Falhou",
};

// --- JSON schemas for each entity type ---

export interface TeamsImportJson {
  type: "teams";
  teams: Array<{
    name: string;
    code: string;
    group?: string;
    flagUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }>;
}

export interface PlayersImportJson {
  type: "players";
  teamCode: string;
  players: Array<{
    name: string;
    number?: number;
    position?: string;
    club?: string;
    photoUrl?: string;
  }>;
}

export interface GroupsImportJson {
  type: "groups";
  groups: Array<{
    name: string;
    description?: string;
  }>;
}

export interface StadiumsImportJson {
  type: "stadiums";
  stadiums: Array<{
    name: string;
    city: string;
    country: string;
    capacity?: number;
    imageUrl?: string;
  }>;
}

export interface MatchesImportJson {
  type: "matches";
  matches: Array<{
    homeTeamCode: string;
    awayTeamCode: string;
    group?: string;
    stadium?: string;
    matchDate: string;
    status?: string;
    phase?: string;
  }>;
}

export interface BadgesImportJson {
  type: "badges";
  badges: Array<{
    name: string;
    description?: string;
    icon?: string;
    category?: string;
    condition?: string;
    points?: number;
    isActive?: boolean;
  }>;
}

// --- API response types ---

export interface ImportBatchResponse {
  id: string;
  type: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  createdAt: string;
  finishedAt: string | null;
  files?: ImportFileResponse[];
}

export interface ImportFileResponse {
  id: string;
  importBatchId: string;
  fileName: string;
  entityType: string;
  status: string;
  totalRecords: number;
  createdRecords: number;
  updatedRecords: number;
  errorMessage: string | null;
  createdAt: string;
  finishedAt: string | null;
}
