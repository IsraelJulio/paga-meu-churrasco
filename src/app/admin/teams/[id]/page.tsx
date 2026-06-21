"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

interface Team {
  id: string;
  name: string;
  code: string;
  group?: string | null;
  flagUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  createdAt: string;
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const startEditing = searchParams.get("edit") === "true";

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(startEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", group: "", flagUrl: "", primaryColor: "#3b82f6", secondaryColor: "#ffffff",
  });

  useEffect(() => {
    fetch(`/api/teams/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTeam(data);
        setForm({
          name: data.name || "",
          code: data.code || "",
          group: data.group || "",
          flagUrl: data.flagUrl || "",
          primaryColor: data.primaryColor || "#3b82f6",
          secondaryColor: data.secondaryColor || "#ffffff",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, group: form.group || null, flagUrl: form.flagUrl || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setTeam(data);
      setEditing(false);
      toast.success("Seleção atualizada!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/teams/${id}`, { method: "DELETE" });
      toast.success("Seleção excluída!");
      router.push("/admin/teams");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (!team) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader
        title={editing ? "Editar Seleção" : team.name}
        description={editing ? undefined : `Código: ${team.code}`}
        backHref="/admin/teams"
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

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        {!editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md"
                style={{ backgroundColor: team.primaryColor || "#6366f1" }}
              >
                {team.code}
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{team.name}</p>
                <p className="text-slate-500">
                  {team.group ? `Grupo ${team.group}` : "Sem grupo"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Cor primária</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md" style={{ backgroundColor: team.primaryColor || "#6366f1" }} />
                  <span className="font-mono text-sm text-slate-700">{team.primaryColor}</span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">Cor secundária</p>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-slate-200" style={{ backgroundColor: team.secondaryColor || "#fff" }} />
                  <span className="font-mono text-sm text-slate-700">{team.secondaryColor}</span>
                </div>
              </div>
            </div>
            {team.flagUrl && (
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 font-medium mb-1">URL da bandeira</p>
                <p className="text-sm text-slate-700 break-all">{team.flagUrl}</p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Nome" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <Input label="Código" value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} maxLength={3} required />
            <Input label="Grupo" value={form.group} onChange={(e) => set("group", e.target.value.toUpperCase())} maxLength={1} />
            <Input label="URL da bandeira" type="url" value={form.flagUrl} onChange={(e) => set("flagUrl", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Cor primária</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer p-1" />
                  <span className="text-sm font-mono text-slate-600">{form.primaryColor}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Cor secundária</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.secondaryColor} onChange={(e) => set("secondaryColor", e.target.value)} className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer p-1" />
                  <span className="text-sm font-mono text-slate-600">{form.secondaryColor}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>Salvar</Button>
            </div>
          </form>
        )}
      </div>

      <ConfirmDialog
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir seleção?"
        description="Todos os jogadores serão excluídos também. Esta ação não pode ser desfeita."
      />
    </div>
  );
}
