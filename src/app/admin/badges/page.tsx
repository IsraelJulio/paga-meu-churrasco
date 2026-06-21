"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Star, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

interface BadgeItem { id: string; name: string; description?: string | null; icon?: string | null; category?: string | null; points: number; isActive: boolean; }

export default function BadgesPage() {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load(q = "") {
    setLoading(true);
    try { const res = await fetch(`/api/badges?search=${encodeURIComponent(q)}`); setBadges(await res.json()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/badges/${deleteId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Conquista excluída!"); setBadges((b) => b.filter((x) => x.id !== deleteId)); }
      else toast.error("Erro ao excluir.");
    } finally { setDeleting(false); setDeleteId(null); }
  }

  return (
    <div>
      <PageHeader title="Conquistas" description="Configure badges e conquistas"
        actions={<Link href="/admin/badges/new"><Button variant="primary" size="sm"><Plus className="h-4 w-4" />Nova conquista</Button></Link>} />
      <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-2 mb-4">
        <Input placeholder="Buscar conquista..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Button type="submit" variant="ghost"><Search className="h-4 w-4" /></Button>
      </form>
      {loading ? <PageSpinner label="Carregando conquistas..." /> : badges.length === 0 ? (
        <EmptyState icon={Star} title="Nenhuma conquista cadastrada" description="Crie badges para motivar os jogadores."
          action={<Link href="/admin/badges/new"><Button variant="primary"><Plus className="h-4 w-4" />Nova conquista</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {badges.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl">
                    {b.icon || "🏆"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{b.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant={b.isActive ? "success" : "default"}>{b.isActive ? "Ativo" : "Inativo"}</Badge>
                      {b.category && <Badge variant="info">{b.category}</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-amber-500">{b.points}pts</p>
                </div>
              </div>
              {b.description && <p className="text-xs text-slate-500 mb-3">{b.description}</p>}
              <div className="flex gap-2">
                <Link href={`/admin/badges/${b.id}`} className="flex-1"><Button variant="ghost" size="sm" className="w-full"><Eye className="h-4 w-4" />Ver</Button></Link>
                <Link href={`/admin/badges/${b.id}?edit=true`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><Edit className="h-4 w-4" />Editar</Button></Link>
                <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeleteId(b.id)}><Trash2 className="h-4 w-4" />Excluir</Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Excluir conquista?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
