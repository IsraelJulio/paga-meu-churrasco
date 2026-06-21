"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

interface Player {
  id: string;
  name: string;
  number?: number | null;
  position?: string | null;
  club?: string | null;
  team: { id: string; name: string; code: string };
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load(q = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/players?search=${encodeURIComponent(q)}`);
      setPlayers(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/players/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Jogador excluído!");
        setPlayers((p) => p.filter((x) => x.id !== deleteId));
      } else toast.error("Erro ao excluir.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Jogadores"
        description="Gerencie os jogadores das seleções"
        actions={
          <Link href="/admin/players/new">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4" /> Novo jogador
            </Button>
          </Link>
        }
      />

      <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-2 mb-4">
        <Input placeholder="Buscar jogador ou clube..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Button type="submit" variant="ghost"><Search className="h-4 w-4" /></Button>
      </form>

      {loading ? <PageSpinner label="Carregando jogadores..." /> : players.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum jogador cadastrado" description="Adicione jogadores às seleções." action={<Link href="/admin/players/new"><Button variant="primary"><Plus className="h-4 w-4" />Novo jogador</Button></Link>} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {players.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                    {p.number ?? "—"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.team.name} • {p.position ?? "—"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/players/${p.id}`} className="flex-1"><Button variant="ghost" size="sm" className="w-full"><Eye className="h-4 w-4" />Ver</Button></Link>
                  <Link href={`/admin/players/${p.id}?edit=true`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><Edit className="h-4 w-4" />Editar</Button></Link>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4" />Excluir</Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["#", "Jogador", "Seleção", "Posição", "Clube", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {players.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm text-slate-600">{p.number ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.team.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.position ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{p.club ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/players/${p.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                        <Link href={`/admin/players/${p.id}?edit=true`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Excluir jogador?" description="Esta ação não pode ser desfeita." />
    </div>
  );
}
