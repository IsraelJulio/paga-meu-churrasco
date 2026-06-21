"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

const positions = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

export default function NewPlayerPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ teamId: "", name: "", number: "", position: "", club: "", photoUrl: "" });

  useEffect(() => {
    fetch("/api/teams").then((r) => r.json()).then(setTeams);
  }, []);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.teamId || !form.name) { toast.error("Seleção e nome são obrigatórios."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, number: form.number ? Number(form.number) : null, position: form.position || null, club: form.club || null, photoUrl: form.photoUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Jogador criado!");
      router.push("/admin/players");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro");
    } finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Novo Jogador" description="Adicione um jogador a uma seleção" backHref="/admin/players" />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select label="Seleção" value={form.teamId} onChange={(e) => set("teamId", e.target.value)} required>
            <option value="">Selecione...</option>
            {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
          <Input label="Nome do jogador" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Número" type="number" min={1} max={99} value={form.number} onChange={(e) => set("number", e.target.value)} />
            <Select label="Posição" value={form.position} onChange={(e) => set("position", e.target.value)}>
              <option value="">—</option>
              {positions.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>
          </div>
          <Input label="Clube" placeholder="ex: Flamengo" value={form.club} onChange={(e) => set("club", e.target.value)} />
          <Input label="URL da foto" type="url" placeholder="https://..." value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.push("/admin/players")} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>Criar jogador</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
