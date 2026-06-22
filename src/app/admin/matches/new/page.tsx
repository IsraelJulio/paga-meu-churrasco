"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

const statuses = ["Scheduled", "Live", "Finished", "Canceled"];
const phases = ["GroupStage", "RoundOf16", "QuarterFinal", "SemiFinal", "Final"];
const phaseLabels: Record<string, string> = { GroupStage: "Fase de Grupos", RoundOf16: "Oitavas", QuarterFinal: "Quartas", SemiFinal: "Semifinal", Final: "Final" };

export default function NewMatchPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);
  const [stadiums, setStadiums] = useState<{ id: string; name: string; city: string }[]>([]);
  const [rounds, setRounds] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ homeTeamId: "", awayTeamId: "", groupId: "", stadiumId: "", roundId: "", matchDate: "", homeScore: "", awayScore: "", status: "Scheduled", phase: "GroupStage" });

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/stadiums").then((r) => r.json()),
      fetch("/api/rounds").then((r) => r.json()),
    ]).then(([t, g, s, r]) => { setTeams(t); setGroups(g); setStadiums(s); setRounds(r); });
  }, []);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.homeTeamId || !form.awayTeamId || !form.matchDate) { toast.error("Times e data são obrigatórios."); return; }
    if (form.homeTeamId === form.awayTeamId) { toast.error("Os times não podem ser iguais."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, groupId: form.groupId || null, stadiumId: form.stadiumId || null, roundId: form.roundId || null, homeScore: form.homeScore !== "" ? Number(form.homeScore) : null, awayScore: form.awayScore !== "" ? Number(form.awayScore) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Partida criada!");
      router.push("/admin/matches");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Nova Partida" description="Agende uma nova partida" backHref="/admin/matches" />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <Select label="Rodada (opcional)" value={form.roundId} onChange={(e) => set("roundId", e.target.value)}>
            <option value="">— Sem rodada —</option>
            {rounds.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
          <Select label="Grupo (opcional)" value={form.groupId} onChange={(e) => set("groupId", e.target.value)}>
            <option value="">—</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          <Select label="Estádio (opcional)" value={form.stadiumId} onChange={(e) => set("stadiumId", e.target.value)}>
            <option value="">—</option>
            {stadiums.map((s) => <option key={s.id} value={s.id}>{s.name} – {s.city}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Placar casa" type="number" min={0} value={form.homeScore} onChange={(e) => set("homeScore", e.target.value)} hint="Deixe vazio se não iniciou" />
            <Input label="Placar visitante" type="number" min={0} value={form.awayScore} onChange={(e) => set("awayScore", e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.push("/admin/matches")} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>Criar partida</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
