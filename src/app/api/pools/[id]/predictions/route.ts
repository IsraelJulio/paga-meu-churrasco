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

  const matches = await prisma.match.findMany({
    where: { status: { not: "Canceled" } },
    include: {
      homeTeam: { select: { id: true, name: true, code: true } },
      awayTeam: { select: { id: true, name: true, code: true } },
      round: { select: { id: true, name: true, phase: true } },
    },
    orderBy: { matchDate: "asc" },
  });

  const predictions = await prisma.prediction.findMany({
    where: { poolId, userId: session.user.id },
    include: { score: true },
  });

  const doublePicks = await prisma.doublePointPick.findMany({
    where: { poolId, userId: session.user.id },
    select: { matchId: true, roundId: true },
  });

  const predMap = new Map(predictions.map((p) => [p.matchId, p]));
  const doubleMap = new Map(doublePicks.map((d) => [d.matchId, d]));

  const result = matches.map((m) => ({
    match: m,
    prediction: predMap.get(m.id) ?? null,
    isDouble: doubleMap.has(m.id),
    doublePickRoundId: doubleMap.get(m.id)?.roundId ?? null,
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

  try {
    const { matchId, predictedHomeScore, predictedAwayScore } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: "matchId é obrigatório" }, { status: 400 });
    }

    const homeScore = Number(predictedHomeScore);
    const awayScore = Number(predictedAwayScore);

    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0) {
      return NextResponse.json({ error: "Placar inválido. Use números inteiros maiores ou iguais a zero." }, { status: 400 });
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 });
    }
    if (match.status !== "Scheduled") {
      return NextResponse.json({ error: "Não é possível palpitar nesta partida. Ela já começou ou foi encerrada." }, { status: 400 });
    }
    if (new Date() >= new Date(match.matchDate)) {
      return NextResponse.json({ error: "O prazo para palpitar nesta partida encerrou." }, { status: 400 });
    }

    const prediction = await prisma.prediction.upsert({
      where: { poolId_userId_matchId: { poolId, userId: session.user.id, matchId } },
      update: {
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
        updatedAt: new Date(),
      },
      create: {
        poolId,
        userId: session.user.id,
        matchId,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore,
      },
    });

    return NextResponse.json(prediction, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
