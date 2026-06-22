import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const pools = await prisma.pool.findMany({
    include: {
      owner: { select: { id: true, name: true, login: true } },
      _count: { select: { participants: true, predictions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pools);
}
