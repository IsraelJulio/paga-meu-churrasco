import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const { inviteCode } = await req.json();
    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: "Código é obrigatório" }, { status: 400 });
    }

    const pool = await prisma.pool.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
    });
    if (!pool) {
      return NextResponse.json({ error: "Código inválido. Verifique e tente novamente." }, { status: 404 });
    }
    if (pool.status !== "Active") {
      return NextResponse.json({ error: "Este bolão não está mais ativo." }, { status: 400 });
    }

    const existing = await prisma.poolParticipant.findUnique({
      where: { poolId_userId: { poolId: pool.id, userId: session.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Você já participa deste bolão.", poolId: pool.id }, { status: 409 });
    }

    const participant = await prisma.poolParticipant.create({
      data: {
        poolId: pool.id,
        userId: session.user.id,
        role: "Member",
      },
    });

    return NextResponse.json({ participant, pool }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
