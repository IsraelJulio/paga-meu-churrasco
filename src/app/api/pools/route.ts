import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateUniqueInviteCode } from "@/lib/inviteCode";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const participants = await prisma.poolParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      pool: {
        include: {
          _count: { select: { participants: true } },
          participants: {
            orderBy: [{ totalPoints: "desc" }, { exactScores: "desc" }],
            select: { userId: true, totalPoints: true },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  const result = participants.map((p) => {
    const ranking = p.pool.participants;
    const position = ranking.findIndex((r) => r.userId === session.user.id) + 1;
    return {
      ...p,
      pool: {
        ...p.pool,
        participantCount: p.pool._count.participants,
        myPosition: position,
      },
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const inviteCode = await generateUniqueInviteCode();

    const pool = await prisma.pool.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        inviteCode,
        ownerId: session.user.id,
        scoringSettings: {
          create: {},
        },
        participants: {
          create: {
            userId: session.user.id,
            role: "Owner",
          },
        },
      },
      include: { participants: true, scoringSettings: true },
    });

    return NextResponse.json(pool, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
