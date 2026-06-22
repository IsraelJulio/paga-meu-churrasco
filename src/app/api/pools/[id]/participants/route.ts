import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id: poolId } = await params;

  const isMember = await prisma.poolParticipant.findUnique({
    where: { poolId_userId: { poolId, userId: session.user.id } },
  });
  if (!isMember && session.user.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const participants = await prisma.poolParticipant.findMany({
    where: { poolId },
    include: {
      user: { select: { id: true, name: true, login: true } },
    },
    orderBy: [
      { totalPoints: "desc" },
      { exactScores: "desc" },
      { correctResults: "desc" },
      { bestStreak: "desc" },
      { joinedAt: "asc" },
    ],
  });

  return NextResponse.json(participants.map((p, i) => ({ ...p, position: i + 1 })));
}
