import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id: poolId, userId } = await params;

  const isMember = await prisma.poolParticipant.findUnique({
    where: { poolId_userId: { poolId, userId: session.user.id } },
  });
  if (!isMember && session.user.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const participant = await prisma.poolParticipant.findUnique({
    where: { poolId_userId: { poolId, userId } },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!participant) {
    return NextResponse.json({ error: "Participante não encontrado" }, { status: 404 });
  }

  const [predictions, badges, allParticipants] = await Promise.all([
    prisma.prediction.findMany({
      where: {
        poolId,
        userId,
        match: { status: "Finished" },
      },
      include: {
        match: {
          include: {
            homeTeam: { select: { name: true, code: true, flagUrl: true, primaryColor: true } },
            awayTeam: { select: { name: true, code: true, flagUrl: true, primaryColor: true } },
          },
        },
        score: {
          select: {
            totalPoints: true,
            exactScorePoints: true,
            resultPoints: true,
            goalDifferencePoints: true,
            totalGoalsPoints: true,
          },
        },
      },
      orderBy: { match: { matchDate: "desc" } },
      take: 30,
    }),
    prisma.userBadge.findMany({
      where: { userId, poolId },
      include: { badge: { select: { id: true, name: true, icon: true, description: true } } },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.poolParticipant.findMany({
      where: { poolId },
      orderBy: [
        { totalPoints: "desc" },
        { exactScores: "desc" },
        { correctResults: "desc" },
        { bestStreak: "desc" },
        { joinedAt: "asc" },
      ],
      select: { userId: true },
    }),
  ]);

  const position = allParticipants.findIndex((p) => p.userId === userId) + 1;

  return NextResponse.json({
    participant: {
      userId: participant.userId,
      role: participant.role,
      totalPoints: participant.totalPoints,
      exactScores: participant.exactScores,
      correctResults: participant.correctResults,
      currentStreak: participant.currentStreak,
      bestStreak: participant.bestStreak,
      badgesCount: participant.badgesCount,
      position,
      user: participant.user,
    },
    predictions: predictions.map((p) => ({
      id: p.id,
      predictedHomeScore: p.predictedHomeScore,
      predictedAwayScore: p.predictedAwayScore,
      match: {
        homeTeam: p.match.homeTeam,
        awayTeam: p.match.awayTeam,
        homeScore: p.match.homeScore,
        awayScore: p.match.awayScore,
        matchDate: p.match.matchDate,
      },
      score: p.score ?? null,
    })),
    badges: badges.map((b) => b.badge),
  });
}
