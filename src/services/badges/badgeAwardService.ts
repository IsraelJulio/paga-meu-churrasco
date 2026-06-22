import { prisma } from "@/lib/prisma";

interface BadgeContext {
  poolId: string;
  userId: string;
  correctResults: number;
  exactScores: number;
  currentStreak: number;
  bestStreak: number;
  doublePickHits: number;
}

export async function awardBadgesForParticipant(ctx: BadgeContext) {
  const awarded: string[] = [];

  const existingBadges = await prisma.userBadge.findMany({
    where: { userId: ctx.userId, poolId: ctx.poolId },
    select: { badgeId: true },
  });
  const existingBadgeIds = new Set(existingBadges.map((b) => b.badgeId));

  async function award(condition: string) {
    const badge = await prisma.badge.findFirst({
      where: { condition, isActive: true },
    });
    if (!badge) return;
    if (existingBadgeIds.has(badge.id)) return;

    await prisma.userBadge.create({
      data: {
        userId: ctx.userId,
        poolId: ctx.poolId,
        badgeId: badge.id,
      },
    });

    existingBadgeIds.add(badge.id);
    awarded.push(badge.name);

    await prisma.poolParticipant.update({
      where: { poolId_userId: { poolId: ctx.poolId, userId: ctx.userId } },
      data: { badgesCount: { increment: 1 } },
    });
  }

  if (ctx.correctResults >= 1) await award("FIRST_CORRECT_RESULT");
  if (ctx.exactScores >= 1) await award("FIRST_EXACT_SCORE");
  if (ctx.exactScores >= 5) await award("FIVE_EXACT_SCORES");
  if (ctx.exactScores >= 10) await award("TEN_EXACT_SCORES");
  if (ctx.bestStreak >= 5) await award("FIVE_CORRECT_RESULTS_STREAK");
  if (ctx.bestStreak >= 10) await award("TEN_CORRECT_RESULTS_STREAK");
  if (ctx.doublePickHits >= 1) await award("FIRST_DOUBLE_PICK_HIT");
  if (ctx.doublePickHits >= 3) await award("THREE_DOUBLE_PICK_HITS");

  return awarded;
}

export async function awardBadgesAfterMatch(matchId: string, poolId?: string) {
  const where = poolId ? { matchId, poolId } : { matchId };

  const scores = await prisma.predictionScore.findMany({
    where,
    select: { userId: true, poolId: true, resultPoints: true, exactScorePoints: true, doubleMultiplier: true, totalPoints: true },
  });

  const grouped = new Map<string, typeof scores>();
  for (const s of scores) {
    const key = `${s.poolId}:${s.userId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(s);
  }

  for (const [, _] of grouped) {
    const first = _[0];
    const participant = await prisma.poolParticipant.findUnique({
      where: { poolId_userId: { poolId: first.poolId, userId: first.userId } },
    });
    if (!participant) continue;

    // Count double pick hits for this pool/user
    const doublePickHits = await prisma.predictionScore.count({
      where: {
        poolId: first.poolId,
        userId: first.userId,
        doubleMultiplier: { gt: 1 },
        totalPoints: { gt: 0 },
      },
    });

    await awardBadgesForParticipant({
      poolId: first.poolId,
      userId: first.userId,
      correctResults: participant.correctResults,
      exactScores: participant.exactScores,
      currentStreak: participant.currentStreak,
      bestStreak: participant.bestStreak,
      doublePickHits,
    });
  }

  // Check for round winner badge
  await checkRoundWinnerBadge(matchId, poolId);
  // Check for first time leader badge
  await checkFirstTimeLead(poolId);
}

async function checkRoundWinnerBadge(matchId: string, poolId?: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { roundId: true },
  });
  if (!match?.roundId) return;

  const roundId = match.roundId;

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { matches: { select: { id: true, status: true } } },
  });
  if (!round) return;

  const allFinished = round.matches.every((m) => m.status === "Finished");
  if (!allFinished) return;

  const matchIds = round.matches.map((m) => m.id);
  const poolIds = poolId
    ? [poolId]
    : await prisma.pool.findMany({ select: { id: true } }).then((ps) => ps.map((p) => p.id));

  for (const pid of poolIds) {
    const roundScores = await prisma.predictionScore.groupBy({
      by: ["userId"],
      where: { poolId: pid, matchId: { in: matchIds } },
      _sum: { totalPoints: true },
      orderBy: { _sum: { totalPoints: "desc" } },
      take: 1,
    });

    if (roundScores.length === 0) continue;
    const winner = roundScores[0];
    if (!winner._sum.totalPoints || winner._sum.totalPoints === 0) continue;

    const badge = await prisma.badge.findFirst({
      where: { condition: "ROUND_WINNER", isActive: true },
    });
    if (!badge) continue;

    const alreadyHas = await prisma.userBadge.findFirst({
      where: { userId: winner.userId, poolId: pid, badgeId: badge.id },
    });
    if (alreadyHas) continue;

    await prisma.userBadge.create({
      data: { userId: winner.userId, poolId: pid, badgeId: badge.id },
    });
    await prisma.poolParticipant.update({
      where: { poolId_userId: { poolId: pid, userId: winner.userId } },
      data: { badgesCount: { increment: 1 } },
    });
  }
}

async function checkFirstTimeLead(poolId?: string) {
  const badge = await prisma.badge.findFirst({
    where: { condition: "FIRST_TIME_LEADER", isActive: true },
  });
  if (!badge) return;

  const poolIds = poolId
    ? [poolId]
    : await prisma.pool.findMany({ select: { id: true } }).then((ps) => ps.map((p) => p.id));

  for (const pid of poolIds) {
    const leader = await prisma.poolParticipant.findFirst({
      where: { poolId: pid },
      orderBy: [
        { totalPoints: "desc" },
        { exactScores: "desc" },
        { correctResults: "desc" },
      ],
    });
    if (!leader || leader.totalPoints === 0) continue;

    const alreadyHas = await prisma.userBadge.findFirst({
      where: { userId: leader.userId, poolId: pid, badgeId: badge.id },
    });
    if (alreadyHas) continue;

    await prisma.userBadge.create({
      data: { userId: leader.userId, poolId: pid, badgeId: badge.id },
    });
    await prisma.poolParticipant.update({
      where: { poolId_userId: { poolId: pid, userId: leader.userId } },
      data: { badgesCount: { increment: 1 } },
    });
  }
}
