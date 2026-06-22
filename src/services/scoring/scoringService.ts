import { ScoringSettings, ScoreBreakdown, DEFAULT_SCORING } from "@/types";
import { prisma } from "@/lib/prisma";

function getMatchResult(home: number, away: number): "home" | "draw" | "away" {
  if (home > away) return "home";
  if (home < away) return "away";
  return "draw";
}

export function calculateScore(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  isDouble: boolean,
  settings: ScoringSettings = DEFAULT_SCORING
): ScoreBreakdown {
  const parts: string[] = [];
  let resultPoints = 0;
  let goalDifferencePoints = 0;
  let totalGoalsPoints = 0;
  let exactScorePoints = 0;

  const predictedResult = getMatchResult(predictedHome, predictedAway);
  const actualResult = getMatchResult(actualHome, actualAway);

  const isCorrectResult = predictedResult === actualResult;
  if (isCorrectResult) {
    resultPoints = settings.correctResultPoints;
    const resultLabel = actualResult === "draw" ? "Acertou o empate" : "Acertou vencedor";
    parts.push(`${resultLabel} (+${resultPoints})`);
  }

  const predictedDiff = predictedHome - predictedAway;
  const actualDiff = actualHome - actualAway;
  if (predictedDiff === actualDiff) {
    goalDifferencePoints = settings.goalDifferencePoints;
    parts.push(`Diferença de gols (+${goalDifferencePoints})`);
  }

  const predictedTotal = predictedHome + predictedAway;
  const actualTotal = actualHome + actualAway;
  if (predictedTotal === actualTotal) {
    totalGoalsPoints = settings.totalGoalsPoints;
    parts.push(`Total de gols (+${totalGoalsPoints})`);
  }

  const isExactScore =
    predictedHome === actualHome && predictedAway === actualAway;
  if (isExactScore) {
    exactScorePoints = settings.exactScorePoints;
    parts.push(`Placar exato (+${exactScorePoints})`);
  }

  const basePoints = resultPoints + goalDifferencePoints + totalGoalsPoints + exactScorePoints;
  const multiplier = isDouble && basePoints > 0 ? settings.doubleMultiplier : 1;
  const totalPoints = basePoints * multiplier;

  if (isDouble && basePoints > 0) {
    parts.push(`Vale o dobro (×${settings.doubleMultiplier})`);
  }

  const explanation =
    parts.length > 0 ? parts.join(" | ") : "Sem pontos";

  return {
    resultPoints,
    goalDifferencePoints,
    totalGoalsPoints,
    exactScorePoints,
    doubleMultiplier: multiplier,
    totalPoints,
    explanation,
    isCorrectResult,
    isExactScore,
    isDouble,
  };
}

export async function getPoolSettings(poolId: string): Promise<ScoringSettings> {
  const settings = await prisma.poolScoringSettings.findUnique({
    where: { poolId },
  });
  if (!settings) return { ...DEFAULT_SCORING };
  return {
    correctResultPoints: settings.correctResultPoints,
    goalDifferencePoints: settings.goalDifferencePoints,
    totalGoalsPoints: settings.totalGoalsPoints,
    exactScorePoints: settings.exactScorePoints,
    doubleMultiplier: settings.doubleMultiplier,
  };
}

export async function calculateMatchScores(matchId: string, poolId?: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match || match.status !== "Finished" || match.homeScore == null || match.awayScore == null) {
    return { processed: 0, error: "Partida não está finalizada ou sem placar" };
  }

  const where = poolId
    ? { matchId, poolId }
    : { matchId };

  const predictions = await prisma.prediction.findMany({ where });

  let processed = 0;

  for (const prediction of predictions) {
    const settings = await getPoolSettings(prediction.poolId);

    const doublePick = await prisma.doublePointPick.findFirst({
      where: {
        poolId: prediction.poolId,
        userId: prediction.userId,
        matchId: prediction.matchId,
      },
    });

    const isDouble = doublePick != null;
    const breakdown = calculateScore(
      prediction.predictedHomeScore,
      prediction.predictedAwayScore,
      match.homeScore,
      match.awayScore,
      isDouble,
      settings
    );

    await prisma.predictionScore.upsert({
      where: { predictionId: prediction.id },
      update: {
        resultPoints: breakdown.resultPoints,
        goalDifferencePoints: breakdown.goalDifferencePoints,
        totalGoalsPoints: breakdown.totalGoalsPoints,
        exactScorePoints: breakdown.exactScorePoints,
        doubleMultiplier: breakdown.doubleMultiplier,
        totalPoints: breakdown.totalPoints,
        explanation: breakdown.explanation,
        calculatedAt: new Date(),
      },
      create: {
        predictionId: prediction.id,
        poolId: prediction.poolId,
        userId: prediction.userId,
        matchId: prediction.matchId,
        resultPoints: breakdown.resultPoints,
        goalDifferencePoints: breakdown.goalDifferencePoints,
        totalGoalsPoints: breakdown.totalGoalsPoints,
        exactScorePoints: breakdown.exactScorePoints,
        doubleMultiplier: breakdown.doubleMultiplier,
        totalPoints: breakdown.totalPoints,
        explanation: breakdown.explanation,
      },
    });

    processed++;
  }

  // Update pool participant totals for each affected pool
  const poolIds = poolId
    ? [poolId]
    : [...new Set(predictions.map((p) => p.poolId))];

  for (const pid of poolIds) {
    await recalculateParticipantTotals(pid);
  }

  return { processed };
}

export async function recalculatePoolScores(poolId: string) {
  const predictions = await prisma.prediction.findMany({
    where: { poolId },
    include: { match: true },
  });

  const finishedPredictions = predictions.filter(
    (p) =>
      p.match.status === "Finished" &&
      p.match.homeScore != null &&
      p.match.awayScore != null
  );

  const matchIds = [...new Set(finishedPredictions.map((p) => p.matchId))];

  for (const matchId of matchIds) {
    await calculateMatchScores(matchId, poolId);
  }

  await recalculateParticipantTotals(poolId);
  return { matchesProcessed: matchIds.length };
}

async function recalculateParticipantTotals(poolId: string) {
  const participants = await prisma.poolParticipant.findMany({
    where: { poolId },
    select: { userId: true },
  });

  for (const { userId } of participants) {
    const scores = await prisma.predictionScore.findMany({
      where: { poolId, userId },
    });

    const predictions = await prisma.prediction.findMany({
      where: { poolId, userId },
      include: { match: true },
    });

    const totalPoints = scores.reduce((s, x) => s + x.totalPoints, 0);
    const exactScores = scores.filter((x) => x.exactScorePoints > 0).length;
    const correctResults = scores.filter((x) => x.resultPoints > 0).length;

    // Calculate streaks
    const finishedPredictions = predictions
      .filter((p) => p.match.status === "Finished")
      .sort((a, b) => new Date(a.match.matchDate).getTime() - new Date(b.match.matchDate).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    for (const pred of finishedPredictions) {
      const score = scores.find((s) => s.matchId === pred.matchId);
      if (score && score.resultPoints > 0) {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    // Current streak = streak from the end
    for (let i = finishedPredictions.length - 1; i >= 0; i--) {
      const pred = finishedPredictions[i];
      const score = scores.find((s) => s.matchId === pred.matchId);
      if (score && score.resultPoints > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    await prisma.poolParticipant.update({
      where: { poolId_userId: { poolId, userId } },
      data: { totalPoints, exactScores, correctResults, currentStreak, bestStreak },
    });
  }
}
