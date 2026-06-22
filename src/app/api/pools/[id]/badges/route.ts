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
  if (!isMember) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const allBadges = await prisma.badge.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const earned = await prisma.userBadge.findMany({
    where: { userId: session.user.id, poolId },
    select: { badgeId: true, earnedAt: true },
  });

  const earnedMap = new Map(earned.map((e) => [e.badgeId, e.earnedAt]));

  const result = allBadges.map((b) => ({
    ...b,
    earned: earnedMap.has(b.id),
    earnedAt: earnedMap.get(b.id) ?? null,
  }));

  return NextResponse.json(result);
}
