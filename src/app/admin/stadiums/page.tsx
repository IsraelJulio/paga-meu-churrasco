"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, Edit, Trash2, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { JsonImportModal } from "@/components/import/json-import-modal";

interface Stadium { id: string; name: string; city: string; country: string; capacity?: number | null; }

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  async function load(q = "") {
    setLoading(true);
    try { const res = await fetch(`/api/stadiums?search=${encodeURIComponent(q)}`); setStadiums(await res.json()); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/stadiums/${deleteId}`, { method: "DELETE" });
      if (res.ok) { toast.success("Estádio excluído!"); setStadiums((s) => s.filter((x) => x.id !== deleteId)); }
      else toast.error("Erro ao excluir.");
    } finally { setDeleting(false); setDeleteId(null); }
  }

  return (
    <div>
      <PageHeader title="Estádios" description="Gerencie os estádios do torneio"
        actions={<div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload className="h-4 w-4" />Importar JSON</Button><Link href="/admin/stadiums/new"><Button variant="primary" size="sm"><Plus className="h-4 w-4" />Novo estádio</Button></Link></div>} />
      <form onSubmit={(e) => { e.preventDefault(); load(search); }} className="flex gap-2 mb-4">
        <Input placeholder="Buscar estádio ou cidade..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
        <Button type="submit" variant="ghost"><Search className="h-4 w-4" /></Button>
      </form>
      {loading ? <PageSpinner label="Carregando estádios..." /> : stadiums.length === 0 ? (
        <EmptyState icon={MapPin} title="Nenhum estádio cadastrado" description="Adicione os estádios do torneio."
          action={<Link href="/admin/stadiums/new"><Button variant="primary"><Plus className="h-4 w-4" />Novo estádio</Button></Link>} />
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:hidden">
            {stadiums.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center"><MapPin className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.city}, {s.country}{s.capacity ? ` · ${s.capacity.toLocaleString()}` : ""}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/stadiums/${s.id}`} className="flex-1"><Button variant="ghost" size="sm" className="w-full"><Eye className="h-4 w-4" />Ver</Button></Link>
                  <Link href={`/admin/stadiums/${s.id}?edit=true`} className="flex-1"><Button variant="outline" size="sm" className="w-full"><Edit className="h-4 w-4" />Editar</Button></Link>
                  <Button variant="danger" size="sm" className="flex-1" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4" />Excluir</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["Estádio", "Cidade", "País", "Capacidade", ""].map((h) => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stadiums.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.city}</td>
                    <td className="px-4 py-3 text-slate-600">{s.country}</td>
                    <td className="px-4 py-3 text-slate-600">{s.capacity?.toLocaleString() ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/stadiums/${s.id}`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
                        <Link href={`/admin/stadiums/${s.id}?edit=true`}><Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button></Link>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Excluir estádio?" description="Esta ação não pode ser desfeita." />
      <JsonImportModal open={showImport} onClose={() => { setShowImport(false); load(search); }} entityType="stadiums" />
    </div>
  );
}
