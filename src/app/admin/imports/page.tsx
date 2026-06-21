"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { IMPORT_ENTITY_LABELS, IMPORT_BATCH_STATUS_LABELS } from "@/types/import";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    Pending: {
      icon: <Clock className="h-3.5 w-3.5" />,
      className: "bg-slate-100 text-slate-600",
    },
    Processing: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      className: "bg-orange-100 text-orange-600",
    },
    Completed: {
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      className: "bg-green-100 text-green-700",
    },
    CompletedWithErrors: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      className: "bg-yellow-100 text-yellow-700",
    },
    Failed: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      className: "bg-red-100 text-red-700",
    },
  };

  const cfg = map[status] ?? map.Pending;
  const label =
    IMPORT_BATCH_STATUS_LABELS[status as keyof typeof IMPORT_BATCH_STATUS_LABELS] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
        cfg.className
      )}
    >
      {cfg.icon}
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface BatchWithFiles {
  id: string;
  type: string;
  status: string;
  totalFiles: number;
  processedFiles: number;
  createdAt: string;
  finishedAt: string | null;
  files: { id: string; status: string }[];
}

export default function ImportsPage() {
  const [batches, setBatches] = useState<BatchWithFiles[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/imports")
      .then((r) => r.json())
      .then((data) => setBatches(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner label="Carregando importações..." />;

  return (
    <div>
      <PageHeader
        title="Importações"
        description="Histórico de importações em lote via JSON"
      />

      {batches.length === 0 ? (
        <EmptyState
          icon={Upload}
          title="Nenhuma importação realizada"
          description={'Acesse um dos CRUDs administrativos e clique em "Importar JSON" para começar.'}
        />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 sm:hidden">
            {batches.map((batch) => (
              <Link key={batch.id} href={`/admin/imports/${batch.id}`}>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-orange-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {IMPORT_ENTITY_LABELS[batch.type as keyof typeof IMPORT_ENTITY_LABELS] ??
                          batch.type}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(batch.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={batch.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      <span className="font-semibold text-slate-700">{batch.totalFiles}</span>{" "}
                      arquivo{batch.totalFiles !== 1 ? "s" : ""}
                    </span>
                    <span>
                      <span className="font-semibold text-slate-700">
                        {batch.processedFiles}
                      </span>{" "}
                      processado{batch.processedFiles !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-end mt-2 text-orange-500">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Arquivos
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {batches.map((batch) => (
                  <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {formatDate(batch.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-900">
                      {IMPORT_ENTITY_LABELS[
                        batch.type as keyof typeof IMPORT_ENTITY_LABELS
                      ] ?? batch.type}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={batch.status} />
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {batch.processedFiles} / {batch.totalFiles}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/admin/imports/${batch.id}`}>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors">
                          Detalhes
                          <ChevronRight className="h-4 w-4" />
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
