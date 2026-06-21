import { prisma } from "@/lib/prisma";
import type { PlayersImportJson } from "@/types/import";
import type { ImportResult } from "./types";

export async function importPlayers(content: unknown): Promise<ImportResult> {
  const data = content as PlayersImportJson;

  if (!data.teamCode) throw new Error("Campo obrigatório ausente: teamCode");

  if (!data.players || !Array.isArray(data.players) || data.players.length === 0) {
    throw new Error("Nenhum registro encontrado no arquivo.");
  }

  const team = await prisma.team.findUnique({ where: { code: data.teamCode } });
  if (!team) throw new Error(`Seleção ${data.teamCode} não encontrada.`);

  let createdRecords = 0;
  let updatedRecords = 0;

  for (const player of data.players) {
    if (!player.name) throw new Error("Campo obrigatório ausente: name");

    const existing = await prisma.player.findFirst({
      where: { teamId: team.id, name: player.name },
    });

    if (existing) {
      await prisma.player.update({
        where: { id: existing.id },
        data: {
          number: player.number ?? existing.number,
          position: player.position ?? existing.position,
          club: player.club ?? existing.club,
          photoUrl: player.photoUrl ?? existing.photoUrl,
        },
      });
      updatedRecords++;
    } else {
      await prisma.player.create({
        data: {
          teamId: team.id,
          name: player.name,
          number: player.number,
          position: player.position,
          club: player.club,
          photoUrl: player.photoUrl,
        },
      });
      createdRecords++;
    }
  }

  return { totalRecords: data.players.length, createdRecords, updatedRecords };
}
