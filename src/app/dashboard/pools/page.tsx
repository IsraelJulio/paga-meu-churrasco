"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserNavbar } from "@/components/layout/user-navbar";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users,
  Plus,
  LogIn,
  Trophy,
  TrendingUp,
  Star,
  ChevronRight,
  Flame,
} from "lucide-react";

interface PoolItem {
  id: string;
  role: string;
  totalPoints: number;
  pool: {
    id: string;
    name: string;
    description?: string;
    status: string;
    inviteCode: string;
    participantCount: number;
    myPosition: number;
  };
}

export default function PoolsPage() {
  const { data: session } = useSession();
  const [pools, setPools] = useState<PoolItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pools")
      .then((r) => r.json())
      .then(setPools)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner label="Carregando bolões..." />;

  return (
    <div className="min-h-screen bg-[#060611] flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-6 animate-slide-up">
          <div>
            <h1 className="text-2xl font-black text-slate-100 font-display tracking-wide">Meus Bolões</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {pools.length} bolão{pools.length !== 1 ? "ns" : ""} encontrado{pools.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/dashboard/pools/new">
            <Button variant="primary" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Criar Bolão
            </Button>
          </Link>
          <Link href="/dashboard/pools/join">
            <Button variant="outline" className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              Entrar com Código
            </Button>
          </Link>
        </div>

        {pools.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum bolão ainda"
            description="Crie um bolão ou entre em um usando o código de convite."
            action={
              <Link href="/dashboard/pools/new">
                <Button variant="primary" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar meu primeiro bolão
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {pools.map((item, i) => (
              <Link key={item.id} href={`/dashboard/pools/${item.pool.id}`}>
                <div
                  className="bg-[#0d0d1e] rounded-2xl p-4 border border-orange-500/15 hover:border-orange-500/35 hover:shadow-[0_0_24px_rgba(249,115,22,0.1)] transition-all duration-200 active:scale-[0.99] animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-orange-500/15 border border-orange-500/25 rounded-xl flex items-center justify-center shrink-0">
                        <Flame className="h-5 w-5 text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h2 className="font-bold text-slate-100 truncate">
                            {item.pool.name}
                          </h2>
                          {item.role === "Owner" && (
                            <span className="shrink-0 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
                              Dono
                            </span>
                          )}
                          {item.pool.status !== "Active" && (
                            <span className="shrink-0 bg-white/8 text-slate-400 text-xs font-medium px-2 py-0.5 rounded-full">
                              {item.pool.status === "Finished" ? "Encerrado" : "Arquivado"}
                            </span>
                          )}
                        </div>
                        {item.pool.description && (
                          <p className="text-sm text-slate-500 truncate">
                            {item.pool.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="h-3.5 w-3.5" />
                            {item.pool.participantCount} participante{item.pool.participantCount !== 1 ? "s" : ""}
                          </span>
                          {item.pool.myPosition > 0 && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <TrendingUp className="h-3.5 w-3.5" />
                              {item.pool.myPosition}º lugar
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }} />
                        <span className="font-black text-xl text-white font-display">
                          {item.totalPoints}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">pts</span>
                      <ChevronRight className="h-4 w-4 text-slate-600 mt-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pools.length > 0 && (
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }} />
              <span className="text-xs text-amber-400 font-medium">
                {pools.reduce((s, p) => s + p.totalPoints, 0)} pontos no total
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
