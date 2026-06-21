import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const stadiums = await prisma.stadium.findMany({
    where: search
      ? { OR: [{ name: { contains: search } }, { city: { contains: search } }] }
      : undefined,
    orderBy: { name: "asc" },
  });
  return NextResponse.json(stadiums);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  try {
    const data = await req.json();
    if (data.capacity) data.capacity = Number(data.capacity);
    const stadium = await prisma.stadium.create({ data });
    return NextResponse.json(stadium, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
