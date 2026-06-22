"use client";
import { use, useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Users, RefreshCw, Crown, Trophy } from "lucide-react";

interface Participant {
  id: string;
  role: string;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
  joinedAt: string;
  user: { id: string; name: string; email: string };
}

interface Pool {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  status: string;
  createdAt: string;
  owner: { id: string; name: string };
  participants: Participant[];
  _count: { predictions: number; predictionScores: number };
}

const STATUS_LABELS: Record<string, string> = {
  Active: "Ativo",
  Finished: "Encerrado",
  Archived: "Arquivado",
};

export default function AdminPoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/admin/pools/${id}`)
      .then((r) => r.json())
      .then(setPool)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      const res = await fetch(`/api/admin/pools/${id}/recalculate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Recalculado! ${data.matchesProcessed} partidas processadas.`);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao recalcular");
    } finally {
      setRecalculating(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (!pool) return <div className="text-slate-500">Bolão não encontrado.</div>;

  const sortedParticipants = [...pool.participants].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div>
      <PageHeader
        title={pool.name}
        backHref="/admin/pools"
        actions={
          <Button
            variant="secondary"
            size="sm"
            loading={recalculating}
            onClick={handleRecalculate}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recalcular Pontuação
          </Button>
        }
      />

      {/* Pool info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Status", value: STATUS_LABELS[pool.status] ?? pool.status },
          { label: "Código", value: pool.inviteCode, mono: true },
          { label: "Palpites", value: String(pool._count.predictions) },
          { label: "Pontuações", value: String(pool._count.predictionScores) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className={`font-black text-slate-900 ${stat.mono ? "font-mono tracking-wider" : ""}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Ranking */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h2 className="font-bold text-slate-900">Ranking de Participantes</h2>
          <Badge variant="default">{pool.participants.length}</Badge>
        </div>

        {sortedParticipants.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>Nenhum participante ainda.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sortedParticipants.map((p, i) => (
              <div key={p.id} className="p-4 flex items-center gap-3">
                <div className="text-lg font-black text-slate-400 w-6 text-center shrink-0">
                  {i + 1}
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 shrink-0">
                  {p.user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-900 truncate">{p.user.name}</span>
                    {p.role === "Owner" && <Crown className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-400">{p.user.email}</p>
                  <div className="flex gap-3 mt-0.5 text-xs text-slate-500">
                    <span>{p.correctResults} acertos</span>
                    <span>{p.exactScores} exatos</span>
                    <span>Entrou {new Date(p.joinedAt).toLocaleDateString("pt-BR")}</span>
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
      </div>
    </div>
  );
}
