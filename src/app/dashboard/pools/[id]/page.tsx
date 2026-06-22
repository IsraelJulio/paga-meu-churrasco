"use client";
import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { PageSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  ChevronLeft,
  Copy,
  Check,
  Target,
  Trophy,
  Crown,
} from "lucide-react";

interface PoolDetail {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  status: string;
  owner: { id: string; name: string };
  _count: { participants: number };
  myParticipant: {
    role: string;
    totalPoints: number;
    exactScores: number;
    correctResults: number;
    currentStreak: number;
    bestStreak: number;
    badgesCount: number;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  Active: "Ativo",
  Finished: "Encerrado",
  Archived: "Arquivado",
};

export default function PoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [pool, setPool] = useState<PoolDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/pools/${id}`)
      .then((r) => r.json())
      .then(setPool)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function copyCode() {
    const code = pool?.inviteCode ?? "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Código copiado!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <PageSpinner label="Carregando bolão..." />;
  if (!pool || !pool.myParticipant) {
    return (
      <div className="min-h-screen bg-[#060611] flex flex-col">
        <UserNavbar userName={session?.user?.name} userRole={session?.user?.role as "User" | "Admin" | undefined} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-slate-400">Bolão não encontrado ou acesso negado.</p>
            <Link href="/dashboard/pools" className="text-orange-400 font-semibold mt-2 block hover:text-orange-300">
              Voltar aos bolões
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const participant = pool.myParticipant;

  return (
    <div className="min-h-screen bg-[#060611] flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href="/dashboard/pools"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-300 mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Meus Bolões
        </Link>

        {/* Header card */}
        <div className="bg-[#0d0d1e] border border-orange-500/25 rounded-2xl p-5 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.1)] animate-slide-up">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-slate-100 font-display tracking-wide">{pool.name}</h1>
                {participant.role === "Owner" && (
                  <Crown className="h-4 w-4 text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.7))" }} />
                )}
              </div>
              {pool.description && (
                <p className="text-slate-400 text-sm">{pool.description}</p>
              )}
              <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                pool.status === "Active"
                  ? "bg-green-500/15 border border-green-500/25 text-green-400"
                  : "bg-white/8 border border-white/10 text-slate-400"
              }`}>
                {STATUS_LABELS[pool.status] ?? pool.status}
              </span>
            </div>
            <div className="text-right shrink-0">
              <div className="text-4xl font-black text-white font-display" style={{ textShadow: "0 0 20px rgba(249,115,22,0.4)" }}>
                {participant.totalPoints}
              </div>
              <div className="text-slate-500 text-xs">pontos</div>
            </div>
          </div>

          {/* Invite code */}
          <div className="bg-white/5 border border-white/8 rounded-xl p-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Código de convite</p>
              <p className="font-black text-xl tracking-widest text-orange-400 font-display" style={{ textShadow: "0 0 12px rgba(249,115,22,0.4)" }}>
                {pool.inviteCode}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="p-2 bg-white/8 hover:bg-orange-500/20 rounded-xl transition-colors border border-white/10 hover:border-orange-500/30"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/dashboard/pools/${id}/predictions`}>
            <div className="bg-[#0d0d1e] rounded-2xl p-4 border border-orange-500/15 hover:border-orange-500/35 hover:shadow-[0_0_22px_rgba(249,115,22,0.12)] transition-all duration-200 active:scale-[0.99]">
              <div className="w-10 h-10 bg-orange-500/15 border border-orange-500/25 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_12px_rgba(249,115,22,0.15)]">
                <Target className="h-5 w-5 text-orange-400" />
              </div>
              <p className="font-bold text-slate-100">Palpites</p>
              <p className="text-xs text-slate-500 mt-0.5">Fazer e ver palpites</p>
            </div>
          </Link>

          <Link href={`/dashboard/pools/${id}/ranking`}>
            <div className="bg-[#0d0d1e] rounded-2xl p-4 border border-amber-500/15 hover:border-amber-500/35 hover:shadow-[0_0_22px_rgba(245,158,11,0.12)] transition-all duration-200 active:scale-[0.99]">
              <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-center justify-center mb-3 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
                <Trophy className="h-5 w-5 text-amber-400" />
              </div>
              <p className="font-bold text-slate-100">Ranking</p>
              <p className="text-xs text-slate-500 mt-0.5">Ver classificação</p>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          Criado por {pool.owner.name}
        </p>
      </main>
    </div>
  );
}
