import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const teamId = searchParams.get("teamId") || "";

  const players = await prisma.player.findMany({
    where: {
      ...(search ? { OR: [{ name: { contains: search } }, { club: { contains: search } }] } : {}),
      ...(teamId ? { teamId } : {}),
    },
    include: { team: { select: { id: true, name: true, code: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(players);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  try {
    const data = await req.json();
    const player = await prisma.player.create({ data });
    return NextResponse.json(player, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
