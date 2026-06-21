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

interface Stadium { id: string; name: string; city: string; country: string; capacity?: number | null; imageUrl?: string | null; }

export default function StadiumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", country: "", capacity: "", imageUrl: "" });

  useEffect(() => {
    fetch(`/api/stadiums/${id}`).then((r) => r.json()).then((data) => {
      setStadium(data);
      setForm({ name: data.name || "", city: data.city || "", country: data.country || "", capacity: data.capacity?.toString() || "", imageUrl: data.imageUrl || "" });
    }).finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/stadiums/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, capacity: form.capacity ? Number(form.capacity) : null, imageUrl: form.imageUrl || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStadium(data);
      setEditing(false);
      toast.success("Estádio atualizado!");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/stadiums/${id}`, { method: "DELETE" });
    toast.success("Estádio excluído!");
    router.push("/admin/stadiums");
  }

  if (loading) return <PageSpinner />;
  if (!stadium) return <div className="text-slate-500">Não encontrado.</div>;

  return (
    <div>
      <PageHeader title={editing ? "Editar Estádio" : stadium.name} description={editing ? undefined : `${stadium.city}, ${stadium.country}`} backHref="/admin/stadiums"
        actions={!editing ? <div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setEditing(true)}><Edit className="h-4 w-4" />Editar</Button><Button variant="danger" size="sm" onClick={() => setShowDelete(true)}><Trash2 className="h-4 w-4" /></Button></div> : undefined} />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        {!editing ? (
          <div className="flex flex-col gap-3">
            {[
              { label: "Nome", value: stadium.name },
              { label: "Cidade", value: stadium.city },
              { label: "País", value: stadium.country },
              { label: "Capacidade", value: stadium.capacity?.toLocaleString() ?? "—" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-semibold text-slate-900">{row.value}</span>
              </div>
            ))}
            {stadium.imageUrl && <p className="text-sm text-slate-500 break-all">{stadium.imageUrl}</p>}
          </div>
        ) : (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input label="Nome" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Cidade" value={form.city} onChange={(e) => set("city", e.target.value)} required />
              <Input label="País" value={form.country} onChange={(e) => set("country", e.target.value)} required />
            </div>
            <Input label="Capacidade" type="number" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
            <Input label="URL da imagem" type="url" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" className="flex-1" onClick={() => setEditing(false)} disabled={saving}>Cancelar</Button>
              <Button type="submit" variant="primary" className="flex-1" loading={saving}>Salvar</Button>
            </div>
          </form>
        )}
      </div>
      <ConfirmDialog open={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} loading={deleting} title="Excluir estádio?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
