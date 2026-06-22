"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { PageSpinner } from "@/components/ui/spinner";
import { ChevronLeft, Lock, Star } from "lucide-react";

interface BadgeItem {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  condition?: string;
  points: number;
  earned: boolean;
  earnedAt?: string | null;
}

export default function BadgesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poolId } = use(params);
  const { data: session } = useSession();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/pools/${poolId}/badges`)
      .then((r) => r.json())
      .then(setBadges)
      .finally(() => setLoading(false));
  }, [poolId]);

  useEffect(() => { load(); }, [load]);

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  if (loading) return <PageSpinner label="Carregando conquistas..." />;

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
          <div className="w-10 h-10 bg-purple-500/15 border border-purple-500/25 rounded-xl flex items-center justify-center">
            <Star className="h-5 w-5 text-purple-400" style={{ filter: "drop-shadow(0 0 6px rgba(168,85,247,0.5))" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100 font-display tracking-wide">Conquistas</h1>
            <p className="text-sm text-slate-500">
              {earned.length} de {badges.length} desbloqueadas
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {badges.length > 0 && (
          <div className="mb-5">
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all shadow-[0_0_8px_rgba(168,85,247,0.5)]"
                style={{ width: `${(earned.length / badges.length) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((earned.length / badges.length) * 100)}% completo
            </p>
          </div>
        )}

        {earned.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3">
              Conquistadas ({earned.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {earned.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-[#0d0d1e] rounded-2xl p-4 border border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.08)] text-center"
                >
                  <div className="text-4xl mb-2">{badge.icon ?? "🏅"}</div>
                  <p className="font-bold text-slate-100 text-sm">{badge.name}</p>
                  {badge.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  )}
                  {badge.earnedAt && (
                    <p className="text-xs text-purple-400 mt-2 font-medium">
                      {new Date(badge.earnedAt).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {locked.length > 0 && (
          <div>
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
              Bloqueadas ({locked.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {locked.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-[#0d0d1e] rounded-2xl p-4 border border-white/6 text-center opacity-50"
                >
                  <div className="relative inline-block mb-2">
                    <div className="text-4xl opacity-30">{badge.icon ?? "🏅"}</div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-slate-500" />
                    </div>
                  </div>
                  <p className="font-bold text-slate-500 text-sm">{badge.name}</p>
                  {badge.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {badge.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {badges.length === 0 && (
          <div className="bg-[#0d0d1e] rounded-2xl p-8 border border-orange-500/15 text-center">
            <p className="text-slate-400">Nenhuma conquista cadastrada ainda.</p>
          </div>
        )}
      </main>
    </div>
  );
}
