"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Trophy, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

interface Group { id: string; name: string; description?: string | null; }

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load(q = "") {
    setLoading(true);
    try { const res = await fetch(`/api/groups?search=${encodeURIComponent(q)}`); setGroups(await res.json()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/groups/${deleteId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Grupo excluído!"); setGroups((g) => g.filter((x) => x.id !== deleteId)); }
      else toast.error("Erro ao excluir.");
    } finally { setDeleting(false); setDeleteId(null); }
  }

  return (
    <div>
      <PageHeader title="Grupos" description="Organize os grupos do torneio"
        actions={<Link href="/admin/groups/new"><Button variant="primary" size="sm"><Plus className="h-4 w-4" />Novo grupo</Button></Link>} />
      <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-2 mb-4">
        <Input placeholder="Buscar grupo..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Button type="submit" variant="ghost"><Search className="h-4 w-4" /></Button>
      </form>
      {loading ? <PageSpinner label="Carregando grupos..." /> : groups.length === 0 ? (
        <EmptyState icon={Trophy} title="Nenhum grupo cadastrado" description="Crie grupos para organizar o torneio."
          action={<Link href="/admin/groups/new"><Button variant="primary"><Plus className="h-4 w-4" />Novo grupo</Button></Link>} />
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((g) => (
            <div key={g.id} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-black text-lg">
                  {g.name.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{g.name}</p>
                  {g.description && <p className="text-xs text-slate-500 mt-0.5">{g.description}</p>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Link href={`/admin/groups/${g.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                <Link href={`/admin/groups/${g.id}?edit=true`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(g.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Excluir grupo?" description="As partidas deste grupo não serão excluídas. Esta ação não pode ser desfeita." />
    </div>
  );
}
