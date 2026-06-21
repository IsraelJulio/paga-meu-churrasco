"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { MATCH_STATUS_LABELS, MATCH_PHASE_LABELS, MatchStatus, MatchPhase } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface Match {
  id: string;
  matchDate: string;
  status: MatchStatus;
  phase: MatchPhase;
  homeScore?: number | null;
  awayScore?: number | null;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  stadium?: { name: string; city: string } | null;
}

const statusVariant: Record<MatchStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  Scheduled: "info", Live: "warning", Finished: "success", Canceled: "danger",
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setLoading(true);
    try { const res = await fetch("/api/matches"); setMatches(await res.json()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/matches/${deleteId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Partida excluída!"); setMatches((m) => m.filter((x) => x.id !== deleteId)); }
      else toast.error("Erro ao excluir.");
    } finally { setDeleting(false); setDeleteId(null); }
  }

  return (
    <div>
      <PageHeader title="Partidas" description="Gerencie as partidas do torneio"
        actions={<Link href="/admin/matches/new"><Button variant="primary" size="sm"><Plus className="h-4 w-4" />Nova partida</Button></Link>} />
      {loading ? <PageSpinner label="Carregando partidas..." /> : matches.length === 0 ? (
        <EmptyState icon={Calendar} title="Nenhuma partida cadastrada" description="Adicione partidas ao calendário do torneio."
          action={<Link href="/admin/matches/new"><Button variant="primary"><Plus className="h-4 w-4" />Nova partida</Button></Link>} />
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusVariant[m.status]}>{MATCH_STATUS_LABELS[m.status]}</Badge>
                  <Badge variant="outline">{MATCH_PHASE_LABELS[m.phase]}</Badge>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(m.matchDate)}</span>
              </div>
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="text-center">
                  <p className="font-black text-lg text-slate-900">{m.homeTeam.code}</p>
                  <p className="text-xs text-slate-500">{m.homeTeam.name}</p>
                </div>
                <div className="text-center px-4 py-1 bg-slate-900 text-white rounded-xl font-black text-xl min-w-[80px]">
                  {m.status === "Scheduled" ? "x" : `${m.homeScore ?? 0} - ${m.awayScore ?? 0}`}
                </div>
                <div className="text-center">
                  <p className="font-black text-lg text-slate-900">{m.awayTeam.code}</p>
                  <p className="text-xs text-slate-500">{m.awayTeam.name}</p>
                </div>
              </div>
              {m.stadium && <p className="text-center text-xs text-slate-400 mb-3">{m.stadium.name}, {m.stadium.city}</p>}
              <div className="flex gap-2">
                <Link href={`/admin/matches/${m.id}`} className="flex-1"><Button variant="ghost" size="sm" className="w-full"><Eye className="h-4 w-4" />Ver</Button></Link>
                <Link href={`/admin/matches/${m.id}?edit=true`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><Edit className="h-4 w-4" />Editar</Button></Link>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeleteId(m.id)}><Trash2 className="h-4 w-4" />Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Excluir partida?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
