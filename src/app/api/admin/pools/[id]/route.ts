import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id } = await params;
  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      scoringSettings: true,
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: [{ totalPoints: "desc" }, { joinedAt: "asc" }],
      },
      _count: { select: { predictions: true, predictionScores: true } },
    },
  });
  if (!pool) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(pool);
}
