import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const phase = searchParams.get("phase") || "";

  const matches = await prisma.match.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(phase ? { phase } : {}),
    },
    include: {
      homeTeam: { select: { id: true, name: true, code: true, flagUrl: true, primaryColor: true } },
      awayTeam: { select: { id: true, name: true, code: true, flagUrl: true, primaryColor: true } },
      group: { select: { id: true, name: true } },
      stadium: { select: { id: true, name: true, city: true } },
    },
    orderBy: { id: "desc" },
  });
  return NextResponse.json(matches);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  try {
    const data = await req.json();
    if (data.matchDate) data.matchDate = new Date(data.matchDate);
    if (data.homeScore !== undefined) data.homeScore = data.homeScore === "" ? null : Number(data.homeScore);
    if (data.awayScore !== undefined) data.awayScore = data.awayScore === "" ? null : Number(data.awayScore);
    const match = await prisma.match.create({ data });
    return NextResponse.json(match, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
