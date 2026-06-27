import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "Admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      login: true,
      role: true,
      createdAt: true,
      _count: { select: { poolsOwned: true, poolParticipants: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(users);
}
