import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runImport } from "@/services/import/importService";
import type { ImportEntityType } from "@/types/import";

const VALID_ENTITY_TYPES: ImportEntityType[] = [
  "teams",
  "players",
  "groups",
  "matches",
  "stadiums",
  "badges",
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id: batchId } = await params;

  let body: { fileName?: unknown; entityType?: unknown; content?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição inválido" }, { status: 400 });
  }

  const { fileName, entityType, content } = body;

  if (!fileName || typeof fileName !== "string") {
    return NextResponse.json({ error: "fileName é obrigatório" }, { status: 400 });
  }

  if (!entityType || !VALID_ENTITY_TYPES.includes(entityType as ImportEntityType)) {
    return NextResponse.json(
      { error: `Tipo de entidade inválido: ${entityType}` },
      { status: 400 }
    );
  }

  if (!content || typeof content !== "object") {
    return NextResponse.json({ error: "content é obrigatório" }, { status: 400 });
  }

  // Validate type field in JSON content
  const contentType = (content as Record<string, unknown>).type;
  if (!contentType) {
    return NextResponse.json(
      { error: "Arquivo inválido: o campo type é obrigatório." },
      { status: 400 }
    );
  }
  if (contentType !== entityType) {
    return NextResponse.json(
      { error: `Tipo inválido: esperado ${entityType}, recebido ${contentType}.` },
      { status: 400 }
    );
  }

  // Create ImportFile record
  const importFile = await prisma.importFile.create({
    data: {
      importBatchId: batchId,
      fileName,
      entityType: entityType as string,
      status: "Processing",
    },
  });

  // Run import logic (transaction per file, rollback only this file on failure)
  try {
    const result = await runImport(entityType as ImportEntityType, content);

    const updated = await prisma.importFile.update({
      where: { id: importFile.id },
      data: {
        status: "Completed",
        totalRecords: result.totalRecords,
        createdRecords: result.createdRecords,
        updatedRecords: result.updatedRecords,
        finishedAt: new Date(),
      },
    });

    await prisma.importBatch.update({
      where: { id: batchId },
      data: { processedFiles: { increment: 1 } },
    });

    return NextResponse.json(updated);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";

    const updated = await prisma.importFile.update({
      where: { id: importFile.id },
      data: {
        status: "Failed",
        errorMessage,
        finishedAt: new Date(),
      },
    });

    await prisma.importBatch.update({
      where: { id: batchId },
      data: { processedFiles: { increment: 1 } },
    });

    return NextResponse.json(updated);
  }
}
