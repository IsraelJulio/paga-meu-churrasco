import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recalculatePoolScores } from "@/services/scoring/scoringService";
import { awardBadgesAfterMatch } from "@/services/badges/badgeAwardService";
import { prisma } from "@/lib/prisma";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { id: poolId } = await params;
  try {
    const result = await recalculatePoolScores(poolId);

    // Award badges after recalculation
    const finishedMatches = await prisma.match.findMany({
      where: { status: "Finished", predictions: { some: { poolId } } },
      select: { id: true },
    });
    for (const m of finishedMatches) {
      await awardBadgesAfterMatch(m.id, poolId);
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
