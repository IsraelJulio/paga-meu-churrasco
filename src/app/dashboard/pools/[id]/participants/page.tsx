"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { PageSpinner } from "@/components/ui/spinner";
import { ChevronLeft, Crown, Star, Users } from "lucide-react";

interface ParticipantEntry {
  id: string;
  position: number;
  role: string;
  joinedAt: string;
  totalPoints: number;
  exactScores: number;
  badgesCount: number;
  userId: string;
  user: { id: string; name: string; email: string };
}

export default function ParticipantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poolId } = use(params);
  const { data: session } = useSession();
  const [participants, setParticipants] = useState<ParticipantEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/pools/${poolId}/participants`)
      .then((r) => r.json())
      .then(setParticipants)
      .finally(() => setLoading(false));
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <PageSpinner label="Carregando participantes..." />;

  return (
    <div className="min-h-screen bg-[#060611] flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href={`/dashboard/pools/${poolId}`}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao bolão
        </Link>

        <div className="flex items-center gap-3 mb-5 animate-slide-up">
          <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/25 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 font-display tracking-wide">Participantes</h1>
            <p className="text-sm text-slate-500">
              {participants.length} pessoa{participants.length !== 1 ? "s" : ""} no bolão
            </p>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="bg-[#0d0d1e] rounded-2xl p-8 border border-orange-500/15 text-center">
            <p className="text-slate-400">Nenhum participante ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`bg-[#0d0d1e] rounded-2xl p-4 border flex items-center gap-3 transition-all ${
                  p.userId === session?.user?.id
                    ? "border-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    : "border-orange-500/12"
                }`}
              >
                <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/20 rounded-full flex items-center justify-center font-bold text-orange-400 shrink-0 text-lg">
                  {p.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-100 truncate">{p.user.name}</span>
                    {p.userId === session?.user?.id && (
                      <span className="shrink-0 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Você
                      </span>
                    )}
                    {p.role === "Owner" && <Crown className="shrink-0 h-3.5 w-3.5 text-amber-400" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">
                      Entrou em {new Date(p.joinedAt).toLocaleDateString("pt-BR")}
                    </span>
                    {p.badgesCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-purple-400">
                        <Star className="h-3 w-3" />
                        {p.badgesCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-xl text-white font-display">{p.totalPoints}</div>
                  <div className="text-xs text-slate-500">pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
