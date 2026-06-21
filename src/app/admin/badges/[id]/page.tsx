"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

const categories = ["Precisão", "Sequência", "Conquista", "Especial", "Social"];

interface BadgeItem { id: string; name: string; description?: string | null; icon?: string | null; category?: string | null; condition?: string | null; points: number; isActive: boolean; }

export default function BadgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [badge, setBadge] = useState<BadgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", category: "", condition: "", points: "0", isActive: "true" });

  useEffect(() => {
    fetch(`/api/badges/${id}`).then((r) => r.json()).then((data) => {
      setBadge(data);
      setForm({ name: data.name || "", description: data.description || "", icon: data.icon || "", category: data.category || "", condition: data.condition || "", points: data.points?.toString() || "0", isActive: data.isActive?.toString() || "true" });
    }).finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/badges/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, points: Number(form.points) || 0, isActive: form.isActive === "true", description: form.description || null, icon: form.icon || null, category: form.category || null, condition: form.condition || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBadge(data);
      setEditing(false);
      toast.success("Conquista atualizada!");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/badges/${id}`, { method: "DELETE" });
    toast.success("Conquista excluída!");
    router.push("/admin/badges");
  }

  if (loading) return <PageSpinner />;
  if (!badge) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader title={editing ? "Editar Conquista" : badge.name} backHref="/admin/badges"
        actions={!editing ? <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4" />Editar</Button><Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button></div> : undefined} />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        {!editing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-4xl">{badge.icon || "🏆"}</div>
              <div>
                <p className="text-xl font-black text-slate-900">{badge.name}</p>
                <div className="flex gap-1.5 mt-1">
                  <Badge variant={badge.isActive ? "success" : "default"}>{badge.isActive ? "Ativo" : "Inativo"}</Badge>
                  {badge.category && <Badge variant="info">{badge.category}</Badge>}
                  <Badge variant="warning">{badge.points} pts</Badge>
                </div>
              </div>
            </div>
            {badge.description && <div className="bg-slate-50 rounded-xl p-3"><p className="text-sm text-slate-700">{badge.description}</p></div>}
            {badge.condition && <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-500 mb-1">Condição</p><p className="text-sm text-slate-700">{badge.condition}</p></div>}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Nome" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <Textarea label="Descrição" value={form.description} onChange={(e) => set("description", e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Ícone (emoji)" value={form.icon} onChange={(e) => set("icon", e.target.value)} maxLength={4} />
              <Select label="Categoria" value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">—</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <Input label="Pontos" type="number" min={0} value={form.points} onChange={(e) => set("points", e.target.value)} />
            <Textarea label="Condição" value={form.condition} onChange={(e) => set("condition", e.target.value)} />
            <Select label="Status" value={form.isActive} onChange={(e) => set("isActive", e.target.value)}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>Salvar</Button>
            </div>
          </form>
        )}
      </div>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleting} title="Excluir conquista?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
