"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle, FileJson } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PageSpinner } from "@/components/ui/spinner";
import type { ImportBatchResponse, ImportFileResponse } from "@/types/import";
import { IMPORT_ENTITY_LABELS, IMPORT_BATCH_STATUS_LABELS } from "@/types/import";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; className: string }> = {
    Pending: { icon: <Clock className="h-3.5 w-3.5" />, className: "bg-slate-100 text-slate-600" },
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
    Failed: { icon: <XCircle className="h-3.5 w-3.5" />, className: "bg-red-100 text-red-700" },
  };

  const cfg = map[status] ?? map.Pending;
  const label =
    IMPORT_BATCH_STATUS_LABELS[status as keyof typeof IMPORT_BATCH_STATUS_LABELS] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold",
        cfg.className
      )}
    >
      {cfg.icon}
      {label}
    </span>
  );
}

interface BatchDetail extends ImportBatchResponse {
  files: ImportFileResponse[];
}

export default function ImportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/imports/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => { if (data) setBatch(data); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner label="Carregando detalhes..." />;
  if (notFound || !batch)
    return (
      <div className="text-center py-12 text-slate-500">Importação não encontrada.</div>
    );

  const entityLabel =
    IMPORT_ENTITY_LABELS[batch.type as keyof typeof IMPORT_ENTITY_LABELS] ?? batch.type;

  const completed = batch.files.filter((f) => f.status === "Completed");
  const failed = batch.files.filter((f) => f.status === "Failed");
  const totalCreated = completed.reduce((s, f) => s + f.createdRecords, 0);
  const totalUpdated = completed.reduce((s, f) => s + f.updatedRecords, 0);

  return (
    <div>
      <PageHeader
        title={`Importação: ${entityLabel}`}
        description={`Criada em ${formatDate(batch.createdAt)}`}
        backHref="/admin/imports"
      />

      {/* Batch overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-black text-slate-900">{batch.totalFiles}</p>
          <p className="text-xs text-slate-500 mt-0.5">Total de arquivos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-black text-green-600">{completed.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Concluídos</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-black text-red-600">{failed.length}</p>
          <p className="text-xs text-slate-500 mt-0.5">Com erro</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-2xl font-black text-blue-600">{totalCreated + totalUpdated}</p>
          <p className="text-xs text-slate-500 mt-0.5">Registros afetados</p>
        </div>
      </div>

      {/* Batch metadata */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Status</p>
          <StatusBadge status={batch.status} />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Início</p>
          <p className="text-sm font-medium text-slate-900">{formatDate(batch.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Término</p>
          <p className="text-sm font-medium text-slate-900">
            {batch.finishedAt ? formatDate(batch.finishedAt) : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Criados</p>
          <p className="text-sm font-semibold text-green-600">{totalCreated}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Atualizados</p>
          <p className="text-sm font-semibold text-blue-600">{totalUpdated}</p>
        </div>
      </div>

      {/* File list */}
      <h2 className="text-base font-bold text-slate-900 mb-3">
        Arquivos ({batch.files.length})
      </h2>

      {batch.files.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          Nenhum arquivo registrado.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {batch.files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileCard({ file }: { file: ImportFileResponse }) {
  const statusConfig = {
    Pending: {
      icon: <Clock className="h-5 w-5 text-slate-400" />,
      label: "Pendente",
      bg: "bg-slate-50",
      border: "border-slate-100",
      textColor: "text-slate-500",
    },
    Processing: {
      icon: <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />,
      label: "Processando",
      bg: "bg-orange-50",
      border: "border-orange-100",
      textColor: "text-orange-600",
    },
    Completed: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: "Concluído",
      bg: "bg-green-50",
      border: "border-green-100",
      textColor: "text-green-600",
    },
    Failed: {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      label: "Falhou",
      bg: "bg-red-50",
      border: "border-red-100",
      textColor: "text-red-600",
    },
  };

  const cfg = statusConfig[file.status as keyof typeof statusConfig] ?? statusConfig.Pending;

  return (
    <div className={cn("rounded-xl border p-4", cfg.bg, cfg.border)}>
      <div className="flex items-center gap-3 mb-2">
        <FileJson className="h-5 w-5 text-orange-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{file.fileName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {cfg.icon}
            <span className={cn("text-xs font-medium", cfg.textColor)}>{cfg.label}</span>
          </div>
        </div>
        {file.finishedAt && (
          <p className="text-xs text-slate-400 shrink-0 hidden sm:block">
            {new Date(file.finishedAt).toLocaleTimeString("pt-BR")}
          </p>
        )}
      </div>

      {file.status === "Completed" && (
        <div className="flex flex-wrap gap-4 mt-2 pl-8">
          <span className="text-xs text-slate-500">
            Total:{" "}
            <span className="font-semibold text-slate-700">{file.totalRecords}</span>
          </span>
          <span className="text-xs text-slate-500">
            Criados:{" "}
            <span className="font-semibold text-green-600">{file.createdRecords}</span>
          </span>
          <span className="text-xs text-slate-500">
            Atualizados:{" "}
            <span className="font-semibold text-blue-600">{file.updatedRecords}</span>
          </span>
        </div>
      )}

      {file.status === "Failed" && file.errorMessage && (
        <div className="flex items-start gap-2 mt-2 pl-8">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{file.errorMessage}</p>
        </div>
      )}
    </div>
  );
}
