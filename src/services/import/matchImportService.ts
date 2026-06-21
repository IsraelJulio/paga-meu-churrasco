import { prisma } from "@/lib/prisma";
import type { MatchesImportJson } from "@/types/import";
import type { ImportResult } from "./types";

const VALID_STATUSES = ["Scheduled", "Live", "Finished", "Canceled"];
const VALID_PHASES = ["GroupStage", "RoundOf16", "QuarterFinal", "SemiFinal", "Final"];

export async function importMatches(content: unknown): Promise<ImportResult> {
  const data = content as MatchesImportJson;

  if (!data.matches || !Array.isArray(data.matches) || data.matches.length === 0) {
    throw new Error("Nenhum registro encontrado no arquivo.");
  }

  let createdRecords = 0;
  let updatedRecords = 0;

  for (const match of data.matches) {
    if (!match.homeTeamCode) throw new Error("Campo obrigatório ausente: homeTeamCode");
    if (!match.awayTeamCode) throw new Error("Campo obrigatório ausente: awayTeamCode");
    if (!match.matchDate) throw new Error("Campo obrigatório ausente: matchDate");

    const matchDate = new Date(match.matchDate);
    if (isNaN(matchDate.getTime())) {
      throw new Error(`Data da partida inválida: ${match.matchDate}`);
    }

    if (match.status && !VALID_STATUSES.includes(match.status)) {
      throw new Error(
        `Status inválido: ${match.status}. Valores aceitos: ${VALID_STATUSES.join(", ")}`
      );
    }
    if (match.phase && !VALID_PHASES.includes(match.phase)) {
      throw new Error(
        `Fase inválida: ${match.phase}. Valores aceitos: ${VALID_PHASES.join(", ")}`
      );
    }

    const homeTeam = await prisma.team.findUnique({ where: { code: match.homeTeamCode } });
    if (!homeTeam) throw new Error(`Seleção ${match.homeTeamCode} não encontrada.`);

    const awayTeam = await prisma.team.findUnique({ where: { code: match.awayTeamCode } });
    if (!awayTeam) throw new Error(`Seleção ${match.awayTeamCode} não encontrada.`);

    let groupId: string | null = null;
    if (match.group) {
      const group = await prisma.group.findFirst({ where: { name: match.group } });
      if (!group) throw new Error(`Grupo "${match.group}" não encontrado.`);
      groupId = group.id;
    }

    let stadiumId: string | null = null;
    if (match.stadium) {
      const stadium = await prisma.stadium.findFirst({ where: { name: match.stadium } });
      if (!stadium) throw new Error(`Estádio "${match.stadium}" não encontrado.`);
      stadiumId = stadium.id;
    }

    const existing = await prisma.match.findFirst({
      where: { homeTeamId: homeTeam.id, awayTeamId: awayTeam.id, matchDate },
    });

    if (existing) {
      await prisma.match.update({
        where: { id: existing.id },
        data: {
          groupId,
          stadiumId,
          status: match.status ?? existing.status,
          phase: match.phase ?? existing.phase,
        },
      });
      updatedRecords++;
    } else {
      await prisma.match.create({
        data: {
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          groupId,
          stadiumId,
          matchDate,
          status: match.status ?? "Scheduled",
          phase: match.phase ?? "GroupStage",
        },
      });
      createdRecords++;
    }
  }

  return { totalRecords: data.matches.length, createdRecords, updatedRecords };
}
