"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { Edit, Trash2, Zap } from "lucide-react";
import { MATCH_STATUS_LABELS, MATCH_PHASE_LABELS, MatchStatus, MatchPhase } from "@/types";
import { formatDateTime, formatDateTimeLocal } from "@/lib/utils";

const statuses = ["Scheduled", "Live", "Finished", "Canceled"];
const phases = ["GroupStage", "RoundOf16", "QuarterFinal", "SemiFinal", "Final"];
const phaseLabels: Record<string, string> = { GroupStage: "Fase de Grupos", RoundOf16: "Oitavas", QuarterFinal: "Quartas", SemiFinal: "Semifinal", Final: "Final" };
const statusVariant: Record<MatchStatus, "default" | "success" | "warning" | "danger" | "info"> = { Scheduled: "info", Live: "warning", Finished: "success", Canceled: "danger" };

interface Match {
  id: string; matchDate: string; status: MatchStatus; phase: MatchPhase;
  homeScore?: number | null; awayScore?: number | null;
  homeTeam: { id: string; name: string; code: string };
  awayTeam: { id: string; name: string; code: string };
  group?: { id: string; name: string } | null;
  stadium?: { id: string; name: string; city: string } | null;
  round?: { id: string; name: string } | null;
  roundId?: string | null;
}

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [stadiums, setStadiums] = useState<{ id: string; name: string; city: string }[]>([]);
  const [rounds, setRounds] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [form, setForm] = useState({
    homeTeamId: "", awayTeamId: "", groupId: "", stadiumId: "", roundId: "",
    matchDate: "", homeScore: "", awayScore: "", status: "Scheduled", phase: "GroupStage",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/matches/${id}`).then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/stadiums").then((r) => r.json()),
      fetch("/api/rounds").then((r) => r.json()),
    ]).then(([mData, tData, gData, sData, rData]) => {
      setMatch(mData);
      setTeams(tData); setGroups(gData); setStadiums(sData); setRounds(rData);
      setForm({
        homeTeamId: mData.homeTeamId || "",
        awayTeamId: mData.awayTeamId || "",
        groupId: mData.groupId || "",
        stadiumId: mData.stadiumId || "",
        roundId: mData.roundId || "",
        matchDate: formatDateTimeLocal(mData.matchDate),
        homeScore: mData.homeScore?.toString() ?? "",
        awayScore: mData.awayScore?.toString() ?? "",
        status: mData.status || "Scheduled",
        phase: mData.phase || "GroupStage",
      });
    }).finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          groupId: form.groupId || null,
          stadiumId: form.stadiumId || null,
          roundId: form.roundId || null,
          homeScore: form.homeScore !== "" ? Number(form.homeScore) : null,
          awayScore: form.awayScore !== "" ? Number(form.awayScore) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMatch(data);
      setEditing(false);
      toast.success("Partida atualizada!");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/matches/${id}`, { method: "DELETE" });
    toast.success("Partida excluída!");
    router.push("/admin/matches");
  }

  async function handleCalculate() {
    setCalculating(true);
    try {
      const res = await fetch(`/api/matches/${id}/calculate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Pontuação gerada! ${data.processed} apostas calculadas.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao calcular pontuação");
    } finally {
      setCalculating(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (!match) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader title={editing ? "Editar Partida" : `${match.homeTeam.code} x ${match.awayTeam.code}`} backHref="/admin/matches"
        actions={!editing ? <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4" />Editar</Button><Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button></div> : undefined} />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        {!editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center"><p className="text-2xl font-black">{match.homeTeam.code}</p><p className="text-xs text-slate-500">{match.homeTeam.name}</p></div>
              <div className="bg-slate-900 text-white px-5 py-2 rounded-xl font-black text-2xl">{match.status === "Scheduled" ? "x" : `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`}</div>
              <div className="text-center"><p className="text-2xl font-black">{match.awayTeam.code}</p><p className="text-xs text-slate-500">{match.awayTeam.name}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant={statusVariant[match.status]}>{MATCH_STATUS_LABELS[match.status]}</Badge>
              <Badge variant="outline">{MATCH_PHASE_LABELS[match.phase]}</Badge>
            </div>
            {[
              { label: "Data", value: formatDateTime(match.matchDate) },
              { label: "Rodada", value: match.round?.name ?? "—" },
              { label: "Grupo", value: match.group?.name ?? "—" },
              { label: "Estádio", value: match.stadium ? `${match.stadium.name}, ${match.stadium.city}` : "—" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
            {match.status === "Finished" && (
              <Button
                variant="primary"
                className="w-full mt-2"
                loading={calculating}
                onClick={handleCalculate}
              >
                <Zap className="h-4 w-4" />
                Gerar pontuação
              </Button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Select label="Time da casa" value={form.homeTeamId} onChange={(e) => set("homeTeamId", e.target.value)} required>
                <option value="">Selecione...</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
              <Select label="Time visitante" value={form.awayTeamId} onChange={(e) => set("awayTeamId", e.target.value)} required>
                <option value="">Selecione...</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </div>
            <Input label="Data e hora" type="datetime-local" value={form.matchDate} onChange={(e) => set("matchDate", e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Fase" value={form.phase} onChange={(e) => set("phase", e.target.value)}>
                {phases.map((p) => <option key={p} value={p}>{phaseLabels[p]}</option>)}
              </Select>
              <Select label="Status" value={form.status} onChange={(e) => set("status", e.target.value)}>
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <Select label="Rodada" value={form.roundId} onChange={(e) => set("roundId", e.target.value)}>
              <option value="">— Sem rodada —</option>
              {rounds.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
            <Select label="Grupo" value={form.groupId} onChange={(e) => set("groupId", e.target.value)}>
              <option value="">—</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </Select>
            <Select label="Estádio" value={form.stadiumId} onChange={(e) => set("stadiumId", e.target.value)}>
              <option value="">—</option>
              {stadiums.map((s) => <option key={s.id} value={s.id}>{s.name} – {s.city}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Placar casa" type="number" min={0} value={form.homeScore} onChange={(e) => set("homeScore", e.target.value)} />
              <Input label="Placar visitante" type="number" min={0} value={form.awayScore} onChange={(e) => set("awayScore", e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>Salvar</Button>
            </div>
          </form>
        )}
      </div>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleting} title="Excluir partida?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
