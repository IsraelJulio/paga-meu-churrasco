import { prisma } from "@/lib/prisma";
import type { BadgesImportJson } from "@/types/import";
import type { ImportResult } from "./types";

export async function importBadges(content: unknown): Promise<ImportResult> {
  const data = content as BadgesImportJson;

  if (!data.badges || !Array.isArray(data.badges) || data.badges.length === 0) {
    throw new Error("Nenhum registro encontrado no arquivo.");
  }

  let createdRecords = 0;
  let updatedRecords = 0;

  for (const badge of data.badges) {
    if (!badge.name) throw new Error("Campo obrigatório ausente: name");

    const existing = badge.condition
      ? await prisma.badge.findFirst({ where: { condition: badge.condition } })
      : null;

    if (existing) {
      await prisma.badge.update({
        where: { id: existing.id },
        data: {
          name: badge.name,
          description: badge.description ?? existing.description,
          icon: badge.icon ?? existing.icon,
          category: badge.category ?? existing.category,
          points: badge.points ?? existing.points,
          isActive: badge.isActive ?? existing.isActive,
        },
      });
      updatedRecords++;
    } else {
      await prisma.badge.create({
        data: {
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          category: badge.category,
          condition: badge.condition,
          points: badge.points ?? 0,
          isActive: badge.isActive ?? true,
        },
      });
      createdRecords++;
    }
  }

  return { totalRecords: data.badges.length, createdRecords, updatedRecords };
}
