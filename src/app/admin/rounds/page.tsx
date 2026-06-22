"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Calendar, Plus, ChevronRight, Trash2 } from "lucide-react";
import { MATCH_PHASE_LABELS } from "@/types";

interface Round {
  id: string;
  name: string;
  description?: string;
  phase: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  _count: { matches: number };
}

export default function AdminRoundsPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rounds");
      const data = await res.json();
      setRounds(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete() {
    if (!showDelete) return;
    setDeleting(showDelete);
    try {
      const res = await fetch(`/api/rounds/${showDelete}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao excluir");
      toast.success("Rodada excluída!");
      setShowDelete(null);
      load();
    } catch {
      toast.error("Erro ao excluir rodada");
    } finally {
      setDeleting(null);
    }
  }

  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader
        title="Rodadas"
        actions={
          <Link href="/admin/rounds/new">
            <Button variant="primary" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Rodada
            </Button>
          </Link>
        }
      />

      {rounds.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhuma rodada cadastrada"
          description="Crie rodadas para organizar as partidas e habilitar a escolha de partida dobrada."
          action={
            <Link href="/admin/rounds/new">
              <Button variant="primary" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Criar rodada
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-2">
          {rounds.map((round) => (
            <div key={round.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <Link href={`/admin/rounds/${round.id}`} className="flex items-center gap-2 mb-1 hover:opacity-80">
                  <span className="font-bold text-slate-900">{round.name}</span>
                  <Badge variant="info">
                    {MATCH_PHASE_LABELS[round.phase as keyof typeof MATCH_PHASE_LABELS] ?? round.phase}
                  </Badge>
                </Link>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {round._count.matches} partidas
                  </span>
                  {round.description && <span>{round.description}</span>}
                </div>
              </div>
              <Link href={`/admin/rounds/${round.id}`}>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </Link>
              <button
                onClick={() => setShowDelete(round.id)}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={showDelete != null}
        onClose={() => setShowDelete(null)}
        onConfirm={handleDelete}
        loading={deleting != null}
        title="Excluir rodada?"
        description="Esta ação removerá a rodada. As partidas associadas não serão excluídas."
      />
    </div>
  );
}
