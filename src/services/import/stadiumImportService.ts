import { prisma } from "@/lib/prisma";
import type { StadiumsImportJson } from "@/types/import";
import type { ImportResult } from "./types";

export async function importStadiums(content: unknown): Promise<ImportResult> {
  const data = content as StadiumsImportJson;

  if (!data.stadiums || !Array.isArray(data.stadiums) || data.stadiums.length === 0) {
    throw new Error("Nenhum registro encontrado no arquivo.");
  }

  let createdRecords = 0;
  let updatedRecords = 0;

  for (const stadium of data.stadiums) {
    if (!stadium.name) throw new Error("Campo obrigatório ausente: name");
    if (!stadium.city) throw new Error("Campo obrigatório ausente: city");
    if (!stadium.country) throw new Error("Campo obrigatório ausente: country");

    const existing = await prisma.stadium.findFirst({
      where: { name: stadium.name, city: stadium.city },
    });

    if (existing) {
      await prisma.stadium.update({
        where: { id: existing.id },
        data: {
          country: stadium.country,
          capacity: stadium.capacity ?? existing.capacity,
          imageUrl: stadium.imageUrl ?? existing.imageUrl,
        },
      });
      updatedRecords++;
    } else {
      await prisma.stadium.create({
        data: {
          name: stadium.name,
          city: stadium.city,
          country: stadium.country,
          capacity: stadium.capacity,
          imageUrl: stadium.imageUrl,
        },
      });
      createdRecords++;
    }
  }

  return { totalRecords: data.stadiums.length, createdRecords, updatedRecords };
}
