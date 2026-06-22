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
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <UserNavbar userName={session?.user?.name} userRole={session?.user?.role as "User" | "Admin" | undefined} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-slate-500">Bolão não encontrado ou acesso negado.</p>
            <Link href="/dashboard/pools" className="text-orange-500 font-semibold mt-2 block">
              Voltar aos bolões
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const participant = pool.myParticipant;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Link
          href="/dashboard/pools"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Meus Bolões
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 mb-4 text-white">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black">{pool.name}</h1>
                {participant.role === "Owner" && (
                  <Crown className="h-4 w-4 text-amber-400" />
                )}
              </div>
              {pool.description && (
                <p className="text-slate-400 text-sm">{pool.description}</p>
              )}
              <span className={`inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                pool.status === "Active" ? "bg-green-500/20 text-green-300" : "bg-slate-600 text-slate-400"
              }`}>
                {STATUS_LABELS[pool.status] ?? pool.status}
              </span>
            </div>
            <div className="text-right shrink-0">
              <div className="text-3xl font-black text-white">{participant.totalPoints}</div>
              <div className="text-slate-400 text-xs">pontos</div>
            </div>
          </div>

          {/* Invite code */}
          <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Código de convite</p>
              <p className="font-black text-xl tracking-widest text-white">
                {pool.inviteCode}
              </p>
            </div>
            <button
              onClick={copyCode}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation cards */}
        <div className="grid grid-cols-2 gap-3">
          <Link href={`/dashboard/pools/${id}/predictions`}>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <p className="font-bold text-slate-900">Palpites</p>
              <p className="text-xs text-slate-400 mt-0.5">Fazer e ver palpites</p>
            </div>
          </Link>

          <Link href={`/dashboard/pools/${id}/ranking`}>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow active:scale-[0.99]">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <p className="font-bold text-slate-900">Ranking</p>
              <p className="text-xs text-slate-400 mt-0.5">Ver classificação</p>
            </div>
          </Link>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Criado por {pool.owner.name}
        </p>
      </main>
    </div>
  );
}
