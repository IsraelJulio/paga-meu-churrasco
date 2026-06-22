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
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Participantes</h1>
            <p className="text-sm text-slate-500">
              {participants.length} pessoa{participants.length !== 1 ? "s" : ""} no bolão
            </p>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
            <p className="text-slate-500">Nenhum participante ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className={`bg-white rounded-2xl p-4 border shadow-sm flex items-center gap-3 ${
                  p.userId === session?.user?.id
                    ? "border-orange-200 ring-1 ring-orange-100"
                    : "border-slate-100"
                }`}
              >
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0 text-lg">
                  {p.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">{p.user.name}</span>
                    {p.userId === session?.user?.id && (
                      <span className="shrink-0 bg-orange-100 text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                        Você
                      </span>
                    )}
                    {p.role === "Owner" && <Crown className="shrink-0 h-3.5 w-3.5 text-amber-500" />}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-slate-500">
                      Entrou em {new Date(p.joinedAt).toLocaleDateString("pt-BR")}
                    </span>
                    {p.badgesCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-purple-500">
                        <Star className="h-3 w-3" />
                        {p.badgesCount}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-black text-xl text-slate-900">{p.totalPoints}</div>
                  <div className="text-xs text-slate-400">pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
