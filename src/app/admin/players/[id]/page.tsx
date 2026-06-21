"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

const positions = ["Goleiro", "Zagueiro", "Lateral", "Volante", "Meia", "Atacante"];

interface Player {
  id: string; name: string; number?: number | null; position?: string | null;
  club?: string | null; photoUrl?: string | null; teamId: string;
  team: { id: string; name: string };
}

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [player, setPlayer] = useState<Player | null>(null);
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ teamId: "", name: "", number: "", position: "", club: "", photoUrl: "" });

  useEffect(() => {
    Promise.all([
      fetch(`/api/players/${id}`).then((r) => r.json()),
      fetch("/api/teams").then((r) => r.json()),
    ]).then(([pData, tData]) => {
      setPlayer(pData);
      setTeams(tData);
      setForm({ teamId: pData.teamId || "", name: pData.name || "", number: pData.number?.toString() || "", position: pData.position || "", club: pData.club || "", photoUrl: pData.photoUrl || "" });
    }).finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, number: form.number ? Number(form.number) : null, position: form.position || null, club: form.club || null, photoUrl: form.photoUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPlayer(data);
      setEditing(false);
      toast.success("Jogador atualizado!");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    toast.success("Jogador excluído!");
    router.push("/admin/players");
  }

  if (loading) return <PageSpinner />;
  if (!player) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader title={editing ? "Editar Jogador" : player.name} description={editing ? undefined : `${player.team.name} · ${player.position ?? "—"}`} backHref="/admin/players"
        actions={!editing ? <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4" />Editar</Button><Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button></div> : undefined} />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        {!editing ? (
          <div className="flex flex-col gap-3">
            {[
              { label: "Seleção", value: player.team.name },
              { label: "Número", value: player.number?.toString() ?? "—" },
              { label: "Posição", value: player.position ?? "—" },
              { label: "Clube", value: player.club ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Select label="Seleção" value={form.teamId} onChange={(e) => set("teamId", e.target.value)} required>
              <option value="">Selecione...</option>
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
            <Input label="Nome" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Número" type="number" value={form.number} onChange={(e) => set("number", e.target.value)} />
              <Select label="Posição" value={form.position} onChange={(e) => set("position", e.target.value)}>
                <option value="">—</option>
                {positions.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <Input label="Clube" value={form.club} onChange={(e) => set("club", e.target.value)} />
            <Input label="URL da foto" type="url" value={form.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>Salvar</Button>
            </div>
          </form>
        )}
      </div>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleting} title="Excluir jogador?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
