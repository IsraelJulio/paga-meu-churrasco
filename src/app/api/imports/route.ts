import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const batches = await prisma.importBatch.findMany({
    orderBy: { createdAt: "desc" },
    include: { files: { select: { id: true, status: true } } },
  });

  return NextResponse.json(batches);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { type, totalFiles } = await req.json();

    if (!type) {
      return NextResponse.json({ error: "Campo type é obrigatório" }, { status: 400 });
    }

    const batch = await prisma.importBatch.create({
      data: { type, totalFiles: totalFiles ?? 0, status: "Processing" },
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
