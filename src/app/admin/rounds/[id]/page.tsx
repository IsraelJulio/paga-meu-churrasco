"use client";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";
import { MATCH_PHASE_LABELS, MATCH_STATUS_LABELS, MatchStatus } from "@/types";
import { formatDateTime, formatDateTimeLocal } from "@/lib/utils";

const phases = ["GroupStage", "RoundOf16", "QuarterFinal", "SemiFinal", "Final"];

interface Round {
  id: string;
  name: string;
  description?: string;
  phase: string;
  startDate?: string | null;
  endDate?: string | null;
  matches: {
    id: string;
    matchDate: string;
    status: string;
    homeTeam: { code: string; name: string };
    awayTeam: { code: string; name: string };
  }[];
}

const statusVariant: Record<MatchStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  Scheduled: "info", Live: "warning", Finished: "success", Canceled: "danger",
};

export default function RoundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [round, setRound] = useState<Round | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", phase: "GroupStage", startDate: "", endDate: "" });

  useEffect(() => {
    fetch(`/api/rounds/${id}`)
      .then((r) => r.json())
      .then((data: Round) => {
        setRound(data);
        setForm({
          name: data.name,
          description: data.description ?? "",
          phase: data.phase,
          startDate: data.startDate ? formatDateTimeLocal(data.startDate) : "",
          endDate: data.endDate ? formatDateTimeLocal(data.endDate) : "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/rounds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          phase: form.phase,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRound((r) => r ? { ...r, ...data } : r);
      setEditing(false);
      toast.success("Rodada atualizada!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/rounds/${id}`, { method: "DELETE" });
    toast.success("Rodada excluída!");
    router.push("/admin/rounds");
  }

  if (loading) return <PageSpinner />;
  if (!round) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader
        title={editing ? "Editar Rodada" : round.name}
        backHref="/admin/rounds"
        actions={
          !editing ? (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4" />
                Editar
              </Button>
              <Button variant="danger" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg mb-5">
        {!editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Badge variant="info">
                {MATCH_PHASE_LABELS[round.phase as keyof typeof MATCH_PHASE_LABELS] ?? round.phase}
              </Badge>
            </div>
            {round.description && <p className="text-slate-600 text-sm">{round.description}</p>}
            {round.startDate && (
              <div className="text-sm text-slate-500">Início: {formatDateTime(round.startDate)}</div>
            )}
            {round.endDate && (
              <div className="text-sm text-slate-500">Fim: {formatDateTime(round.endDate)}</div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Nome *" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <Textarea label="Descrição" value={form.description} onChange={(e) => set("description", e.target.value)} rows={2} />
            <Select label="Fase" value={form.phase} onChange={(e) => set("phase", e.target.value)}>
              {phases.map((p) => (
                <option key={p} value={p}>
                  {MATCH_PHASE_LABELS[p as keyof typeof MATCH_PHASE_LABELS] ?? p}
                </option>
              ))}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Início" type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              <Input label="Fim" type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>
                Salvar
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Matches in round */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50">
          <h2 className="font-bold text-slate-900">
            Partidas nesta rodada ({round.matches.length})
          </h2>
        </div>
        {round.matches.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-sm">
            Nenhuma partida associada a esta rodada ainda.
            Edite as partidas no admin e selecione esta rodada.
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {round.matches.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant[m.status as MatchStatus] ?? "default"}>
                    {MATCH_STATUS_LABELS[m.status as MatchStatus] ?? m.status}
                  </Badge>
                  <span className="font-semibold text-slate-900">
                    {m.homeTeam.code} × {m.awayTeam.code}
                  </span>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(m.matchDate)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir rodada?"
        description="Esta ação não pode ser desfeita."
      />
    </div>
  );
}
