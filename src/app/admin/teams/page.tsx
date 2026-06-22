"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Flag, Edit, Trash2, Eye, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { PageSpinner } from "@/components/ui/spinner";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";
import { JsonImportModal } from "@/components/import/json-import-modal";
import { TeamFlag } from "@/components/ui/team-flag";

interface Team {
  id: string;
  name: string;
  code: string;
  group?: string | null;
  flagUrl?: string | null;
  primaryColor?: string | null;
}

export default function TeamsPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showImport, setShowImport] = useState(false);

  async function load(q = "") {
    setLoading(true);
    try {
      const res = await fetch(`/api/teams?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setTeams(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/teams/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Seleção excluída!");
        setTeams((t) => t.filter((x) => x.id !== deleteId));
      } else {
        toast.error("Erro ao excluir seleção.");
      }
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Seleções"
        description="Gerencie as seleções participantes"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4" />
              Importar JSON
            </Button>
            <Link href="/admin/teams/new">
              <Button variant="primary" size="sm">
                <Plus className="h-4 w-4" />
                Nova seleção
              </Button>
            </Link>
          </div>
        }
      />

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Input
          placeholder="Buscar seleção..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="ghost" size="md">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {loading ? (
        <PageSpinner label="Carregando seleções..." />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Flag}
          title="Nenhuma seleção cadastrada"
          description="Adicione a primeira seleção para começar."
          action={
            <Link href="/admin/teams/new">
              <Button variant="primary">
                <Plus className="h-4 w-4" />
                Nova seleção
              </Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {teams.map((team) => (
              <div
                key={team.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <TeamFlag flagUrl={team.flagUrl} code={team.code} primaryColor={team.primaryColor} size="md" />
                    <div>
                      <p className="font-bold text-slate-900">{team.name}</p>
                      <p className="text-xs text-slate-500">
                        {team.group ? `Grupo ${team.group}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Link href={`/admin/teams/${team.id}`} className="flex-1">
                    <Button variant="ghost" size="sm" className="w-full">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                  </Link>
                  <Link href={`/admin/teams/${team.id}?edit=true`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteId(team.id)}
                    className="flex-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Seleção
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Grupo
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <TeamFlag flagUrl={team.flagUrl} code={team.code} primaryColor={team.primaryColor} size="sm" />
                        <span className="font-medium text-slate-900">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-sm">
                      {team.code}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {team.group ? `Grupo ${team.group}` : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/teams/${team.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/teams/${team.id}?edit=true`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Excluir seleção?"
        description="Todos os jogadores desta seleção também serão excluídos. Esta ação não pode ser desfeita."
      />
      <JsonImportModal
        open={showImport}
        onClose={() => { setShowImport(false); load(search); }}
        entityType="teams"
      />
    </div>
  );
}
