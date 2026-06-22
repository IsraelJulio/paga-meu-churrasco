"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { PageSpinner } from "@/components/ui/spinner";
import { ChevronLeft, Crown, Flame, Target, Trophy } from "lucide-react";

interface RankingEntry {
  position: number;
  isMe: boolean;
  userId: string;
  role: string;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
  currentStreak: number;
  bestStreak: number;
  badgesCount: number;
  user: { id: string; name: string };
  recentBadges: { id: string; icon?: string; name: string }[];
}

const positionColors: Record<number, string> = {
  1: "text-amber-500",
  2: "text-slate-400",
  3: "text-amber-700",
};

export default function RankingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poolId } = use(params);
  const { data: session } = useSession();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/pools/${poolId}/ranking`)
      .then((r) => r.json())
      .then(setRanking)
      .finally(() => setLoading(false));
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  const me = ranking.find((r) => r.isMe);

  if (loading) return <PageSpinner label="Carregando ranking..." />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href={`/dashboard/pools/${poolId}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao bolão
        </Link>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Ranking</h1>
            <p className="text-sm text-slate-500">{ranking.length} participante{ranking.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* My position banner */}
        {me && (
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-4 mb-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs font-medium mb-0.5">Minha posição</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black">{me.position}º</span>
                  <span className="text-xl font-bold text-orange-100">—</span>
                  <span className="text-xl font-bold">{me.totalPoints} pts</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-orange-100 text-xs">Placares exatos</div>
                <div className="font-black text-xl">{me.exactScores}</div>
              </div>
            </div>
          </div>
        )}

        {ranking.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
            <p className="text-slate-500">Nenhum participante ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {ranking.map((entry) => (
              <div
                key={entry.userId}
                className={`bg-white rounded-2xl p-4 border shadow-sm ${
                  entry.isMe ? "border-orange-300 ring-1 ring-orange-200" : "border-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Position */}
                  <div className={`text-xl font-black w-8 text-center shrink-0 ${positionColors[entry.position] ?? "text-slate-600"}`}>
                    {entry.position === 1 ? (
                      <Crown className="h-6 w-6 text-amber-500 mx-auto" />
                    ) : (
                      entry.position
                    )}
                  </div>

                  {/* Avatar + name */}
                  <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">
                    {entry.user.name[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 truncate">
                        {entry.user.name}
                      </span>
                      {entry.isMe && (
                        <span className="shrink-0 bg-orange-100 text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                          Você
                        </span>
                      )}
                      {entry.role === "Owner" && (
                        <Crown className="shrink-0 h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Target className="h-3 w-3" />
                        {entry.exactScores} exatos
                      </span>
                      {entry.currentStreak > 1 && (
                        <span className="flex items-center gap-1 text-xs text-orange-500 font-semibold">
                          <Flame className="h-3 w-3" />
                          {entry.currentStreak} seguidos
                        </span>
                      )}
                    </div>
                    {/* Recent badges */}
                    {entry.recentBadges.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {entry.recentBadges.map((b) => (
                          <span key={b.id} title={b.name} className="text-sm">
                            {b.icon ?? "🏅"}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Points */}
                  <div className="text-right shrink-0">
                    <div className="font-black text-xl text-slate-900">{entry.totalPoints}</div>
                    <div className="text-xs text-slate-400">pts</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
