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

  const picks = await prisma.doublePointPick.findMany({
    where: { poolId, userId: session.user.id },
    include: { round: { select: { id: true, name: true } } },
  });

  return NextResponse.json(picks);
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
    const { matchId } = await req.json();
    if (!matchId) {
      return NextResponse.json({ error: "matchId é obrigatório" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { id: true, matchDate: true, status: true, roundId: true },
    });
    if (!match) {
      return NextResponse.json({ error: "Partida não encontrada" }, { status: 404 });
    }
    if (match.status !== "Scheduled") {
      return NextResponse.json({ error: "Não é possível escolher esta partida. Ela já começou ou foi encerrada." }, { status: 400 });
    }
    if (new Date() >= new Date(match.matchDate)) {
      return NextResponse.json({ error: "O prazo para escolher partida dobrada encerrou." }, { status: 400 });
    }
    if (!match.roundId) {
      return NextResponse.json({ error: "Esta partida não está associada a uma rodada." }, { status: 400 });
    }

    // Check for existing pick in the same round
    const existing = await prisma.doublePointPick.findUnique({
      where: { poolId_userId_roundId: { poolId, userId: session.user.id, roundId: match.roundId } },
    });

    if (existing) {
      if (existing.matchId === matchId) {
        // Already picked this match — remove it (toggle)
        await prisma.doublePointPick.delete({ where: { id: existing.id } });
        return NextResponse.json({ removed: true });
      }
      // Different match in same round
      return NextResponse.json(
        { error: "Você já escolheu uma partida para valer o dobro nesta rodada." },
        { status: 409 }
      );
    }

    const pick = await prisma.doublePointPick.create({
      data: {
        poolId,
        userId: session.user.id,
        roundId: match.roundId,
        matchId,
      },
    });

    return NextResponse.json(pick, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
