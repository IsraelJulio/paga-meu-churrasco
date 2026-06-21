"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

interface Group { id: string; name: string; description?: string | null; }

export default function GroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetch(`/api/groups/${id}`).then((r) => r.json()).then((data) => {
      setGroup(data);
      setForm({ name: data.name || "", description: data.description || "" });
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/groups/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, description: form.description || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGroup(data);
      setEditing(false);
      toast.success("Grupo atualizado!");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/groups/${id}`, { method: "DELETE" });
    toast.success("Grupo excluído!");
    router.push("/admin/groups");
  }

  if (loading) return <PageSpinner />;
  if (!group) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader title={editing ? "Editar Grupo" : group.name} backHref="/admin/groups"
        actions={!editing ? <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4" />Editar</Button><Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button></div> : undefined} />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        {!editing ? (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-500">Nome</span>
              <span className="text-sm font-semibold text-slate-900">{group.name}</span>
            </div>
            <div className="py-2">
              <span className="text-sm text-slate-500 block mb-1">Descrição</span>
              <span className="text-sm text-slate-700">{group.description || "—"}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Nome" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <Textarea label="Descrição" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>Salvar</Button>
            </div>
          </form>
        )}
      </div>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleting} title="Excluir grupo?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
