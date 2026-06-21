import { prisma } from "@/lib/prisma";
import type { GroupsImportJson } from "@/types/import";
import type { ImportResult } from "./types";

export async function importGroups(content: unknown): Promise<ImportResult> {
  const data = content as GroupsImportJson;

  if (!data.groups || !Array.isArray(data.groups) || data.groups.length === 0) {
    throw new Error("Nenhum registro encontrado no arquivo.");
  }

  let createdRecords = 0;
  let updatedRecords = 0;

  for (const group of data.groups) {
    if (!group.name) throw new Error("Campo obrigatório ausente: name");

    const existing = await prisma.group.findFirst({ where: { name: group.name } });

    if (existing) {
      await prisma.group.update({
        where: { id: existing.id },
        data: { description: group.description ?? existing.description },
      });
      updatedRecords++;
    } else {
      await prisma.group.create({
        data: { name: group.name, description: group.description },
      });
      createdRecords++;
    }
  }

  return { totalRecords: data.groups.length, createdRecords, updatedRecords };
}
