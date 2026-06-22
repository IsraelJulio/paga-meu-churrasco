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
      user: { select: { id: true, name: true } },
    },
    orderBy: [
      { totalPoints: "desc" },
      { exactScores: "desc" },
      { correctResults: "desc" },
      { bestStreak: "desc" },
      { joinedAt: "asc" },
    ],
  });

  const withBadges = await Promise.all(
    participants.map(async (p, index) => {
      const badges = await prisma.userBadge.findMany({
        where: { userId: p.userId, poolId },
        include: { badge: { select: { id: true, icon: true, name: true } } },
        orderBy: { earnedAt: "desc" },
        take: 3,
      });
      return {
        ...p,
        position: index + 1,
        isMe: p.userId === session.user.id,
        recentBadges: badges.map((b) => b.badge),
      };
    })
  );

  return NextResponse.json(withBadges);
}
