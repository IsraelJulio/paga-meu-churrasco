import { prisma } from "@/lib/prisma";
import type { TeamsImportJson } from "@/types/import";
import type { ImportResult } from "./types";

export async function importTeams(content: unknown): Promise<ImportResult> {
  const data = content as TeamsImportJson;

  if (!data.teams || !Array.isArray(data.teams) || data.teams.length === 0) {
    throw new Error("Nenhum registro encontrado no arquivo.");
  }

  let createdRecords = 0;
  let updatedRecords = 0;

  for (const team of data.teams) {
    if (!team.name) throw new Error("Campo obrigatório ausente: name");
    if (!team.code) throw new Error("Campo obrigatório ausente: code");

    const existing = await prisma.team.findUnique({ where: { code: team.code } });

    if (existing) {
      await prisma.team.update({
        where: { code: team.code },
        data: {
          name: team.name,
          group: team.group ?? existing.group,
          flagUrl: team.flagUrl ?? existing.flagUrl,
          primaryColor: team.primaryColor ?? existing.primaryColor,
          secondaryColor: team.secondaryColor ?? existing.secondaryColor,
        },
      });
      updatedRecords++;
    } else {
      await prisma.team.create({
        data: {
          name: team.name,
          code: team.code,
          group: team.group,
          flagUrl: team.flagUrl,
          primaryColor: team.primaryColor,
          secondaryColor: team.secondaryColor,
        },
      });
      createdRecords++;
    }
  }

  return { totalRecords: data.teams.length, createdRecords, updatedRecords };
}
