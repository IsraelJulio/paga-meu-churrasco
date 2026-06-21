import type { ImportEntityType } from "@/types/import";
import type { ImportResult } from "./types";
import { importTeams } from "./teamImportService";
import { importPlayers } from "./playerImportService";
import { importGroups } from "./groupImportService";
import { importStadiums } from "./stadiumImportService";
import { importMatches } from "./matchImportService";
import { importBadges } from "./badgeImportService";

export async function runImport(
  entityType: ImportEntityType,
  content: unknown
): Promise<ImportResult> {
  switch (entityType) {
    case "teams":
      return importTeams(content);
    case "players":
      return importPlayers(content);
    case "groups":
      return importGroups(content);
    case "stadiums":
      return importStadiums(content);
    case "matches":
      return importMatches(content);
    case "badges":
      return importBadges(content);
    default:
      throw new Error(`Tipo de entidade desconhecido: ${entityType}`);
  }
}
