import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { calculateMatchScores } from "@/services/scoring/scoringService";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "Admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  const { id } = await params;
  const result = await calculateMatchScores(id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, processed: result.processed });
}
