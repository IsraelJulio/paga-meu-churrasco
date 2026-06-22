"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Users, ChevronRight } from "lucide-react";

interface Pool {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  status: string;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  _count: { participants: number; predictions: number };
}

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  Active: "success",
  Finished: "info",
  Archived: "warning",
};
const STATUS_LABELS: Record<string, string> = {
  Active: "Ativo",
  Finished: "Encerrado",
  Archived: "Arquivado",
};

export default function AdminPoolsPage() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pools")
      .then((r) => r.json())
      .then(setPools)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div>
      <PageHeader title="Bolões" />

      {pools.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum bolão criado" description="Os bolões criados pelos usuários aparecerão aqui." />
      ) : (
        <div className="flex flex-col gap-2">
          {pools.map((pool) => (
            <Link key={pool.id} href={`/admin/pools/${pool.id}`}>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{pool.name}</span>
                    <Badge variant={STATUS_VARIANT[pool.status] ?? "default"}>
                      {STATUS_LABELS[pool.status] ?? pool.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>Código: <span className="font-mono font-bold">{pool.inviteCode}</span></span>
                    <span>Dono: {pool.owner.name}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {pool._count.participants} participantes
                    </span>
                    <span>{pool._count.predictions} palpites</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
