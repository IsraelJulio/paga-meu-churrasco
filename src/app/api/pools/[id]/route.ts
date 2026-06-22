import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getParticipant(poolId: string, userId: string) {
  return prisma.poolParticipant.findUnique({
    where: { poolId_userId: { poolId, userId } },
  });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const participant = await getParticipant(id, session.user.id);
  if (!participant && session.user.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const pool = await prisma.pool.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      scoringSettings: true,
      _count: { select: { participants: true } },
    },
  });
  if (!pool) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json({ ...pool, myParticipant: participant });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const participant = await getParticipant(id, session.user.id);
  const isAdmin = session.user.role === "Admin";
  const isOwner = participant?.role === "Owner";

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { name, description, status } = await req.json();
    const pool = await prisma.pool.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(status ? { status } : {}),
      },
    });
    return NextResponse.json(pool);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const participant = await getParticipant(id, session.user.id);
  const isAdmin = session.user.role === "Admin";
  const isOwner = participant?.role === "Owner";

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    await prisma.pool.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
