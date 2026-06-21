"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  FileJson,
  AlertCircle,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ImportEntityType, ImportFileResponse } from "@/types/import";
import { IMPORT_ENTITY_LABELS } from "@/types/import";

interface FileItem {
  localId: string;
  file: File;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  totalRecords?: number;
  createdRecords?: number;
  updatedRecords?: number;
  errorMessage?: string;
}

interface JsonImportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: ImportEntityType;
}

export function JsonImportModal({ open, onClose, entityType }: JsonImportModalProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"select" | "processing" | "done">("select");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const items: FileItem[] = Array.from(incoming)
      .filter((f) => f.name.toLowerCase().endsWith(".json"))
      .map((f) => ({
        localId: Math.random().toString(36).slice(2),
        file: f,
        status: "Pending",
      }));
    if (items.length === 0) return;
    setFiles((prev) => {
      const existingNames = new Set(prev.map((x) => x.file.name));
      return [...prev, ...items.filter((i) => !existingNames.has(i.file.name))];
    });
  }, []);

  function removeFile(localId: string) {
    setFiles((prev) => prev.filter((f) => f.localId !== localId));
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  async function startImport() {
    if (files.length === 0 || phase === "processing") return;

    setPhase("processing");

    // Create batch
    let batchIdLocal: string;
    try {
      const batchRes = await fetch("/api/imports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: entityType, totalFiles: files.length }),
      });
      const batch = await batchRes.json();
      if (!batchRes.ok) throw new Error(batch.error || "Erro ao criar lote");
      batchIdLocal = batch.id;
      setBatchId(batch.id);
    } catch {
      setPhase("select");
      return;
    }

    const localResults: { status: "Completed" | "Failed" }[] = [];

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];

      setFiles((prev) =>
        prev.map((f) => (f.localId === fileItem.localId ? { ...f, status: "Processing" } : f))
      );

      let text: string;
      try {
        text = await fileItem.file.text();
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.localId === fileItem.localId
              ? { ...f, status: "Failed", errorMessage: "Erro ao ler o arquivo." }
              : f
          )
        );
        localResults.push({ status: "Failed" });
        continue;
      }

      let content: unknown;
      try {
        content = JSON.parse(text);
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.localId === fileItem.localId
              ? { ...f, status: "Failed", errorMessage: "Arquivo JSON inválido." }
              : f
          )
        );
        localResults.push({ status: "Failed" });
        continue;
      }

      try {
        const res = await fetch(`/api/imports/${batchIdLocal}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: fileItem.file.name, entityType, content }),
        });
        const result: ImportFileResponse = await res.json();

        if (result.status === "Completed") {
          setFiles((prev) =>
            prev.map((f) =>
              f.localId === fileItem.localId
                ? {
                    ...f,
                    status: "Completed",
                    totalRecords: result.totalRecords,
                    createdRecords: result.createdRecords,
                    updatedRecords: result.updatedRecords,
                  }
                : f
            )
          );
          localResults.push({ status: "Completed" });
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.localId === fileItem.localId
                ? {
                    ...f,
                    status: "Failed",
                    errorMessage: result.errorMessage || "Erro ao processar arquivo.",
                  }
                : f
            )
          );
          localResults.push({ status: "Failed" });
        }
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.localId === fileItem.localId
              ? { ...f, status: "Failed", errorMessage: "Erro de comunicação com o servidor." }
              : f
          )
        );
        localResults.push({ status: "Failed" });
      }
    }

    // Finalize batch status
    const allFailed = localResults.every((r) => r.status === "Failed");
    const someFailed = localResults.some((r) => r.status === "Failed");
    const finalStatus = allFailed ? "Failed" : someFailed ? "CompletedWithErrors" : "Completed";

    await fetch(`/api/imports/${batchIdLocal}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: finalStatus, finishedAt: new Date().toISOString() }),
    }).catch(() => {});

    setPhase("done");
  }

  function handleClose() {
    if (phase === "processing") return;
    setFiles([]);
    setBatchId(null);
    setPhase("select");
    onClose();
  }

  function handleReset() {
    setFiles([]);
    setBatchId(null);
    setPhase("select");
  }

  if (!open) return null;

  const completed = files.filter((f) => f.status === "Completed");
  const failed = files.filter((f) => f.status === "Failed");
  const totalCreated = completed.reduce((s, f) => s + (f.createdRecords ?? 0), 0);
  const totalUpdated = completed.reduce((s, f) => s + (f.updatedRecords ?? 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div
        className={cn(
          "relative z-10 w-full bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl",
          "sm:max-w-2xl max-h-[92vh] flex flex-col"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Importar {IMPORT_ENTITY_LABELS[entityType]}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Selecione arquivos .json para importar em lote
            </p>
          </div>
          {phase !== "processing" && (
            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-500"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {/* Phase: select */}
          {phase === "select" && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
                  isDragging
                    ? "border-orange-400 bg-orange-50"
                    : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/50"
                )}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-slate-400" />
                <p className="font-semibold text-slate-700 mb-1">
                  Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-sm text-slate-500">Apenas arquivos .json</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(e.target.files)}
                />
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-slate-700">
                    {files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado
                    {files.length !== 1 ? "s" : ""}
                  </p>
                  {files.map((f) => (
                    <div
                      key={f.localId}
                      className="flex items-center gap-3 bg-slate-50 rounded-xl p-3"
                    >
                      <FileJson className="h-5 w-5 text-orange-500 shrink-0" />
                      <span className="flex-1 text-sm text-slate-700 truncate">{f.file.name}</span>
                      <span className="text-xs text-slate-400 shrink-0">
                        {(f.file.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => removeFile(f.localId)}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Phase: processing or done — show file progress cards */}
          {(phase === "processing" || phase === "done") && (
            <div className="flex flex-col gap-3">
              {files.map((f, idx) => (
                <FileProgressCard key={f.localId} file={f} index={idx + 1} />
              ))}
            </div>
          )}

          {/* Phase: done — summary */}
          {phase === "done" && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
              <p className="font-bold text-slate-900 mb-3">Resumo da importação</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SummaryCard label="Arquivos" value={files.length} />
                <SummaryCard label="Concluídos" value={completed.length} color="green" />
                <SummaryCard label="Com erro" value={failed.length} color="red" />
                <SummaryCard label="Criados" value={totalCreated} color="blue" />
                <SummaryCard label="Atualizados" value={totalUpdated} color="purple" />
              </div>
              {batchId && (
                <a
                  href={`/admin/imports/${batchId}`}
                  className="mt-3 flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Ver detalhes da importação
                  <ChevronRight className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 shrink-0 flex gap-3">
          {phase === "select" && (
            <>
              <Button variant="ghost" size="md" onClick={handleClose} className="flex-1 sm:flex-none">
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={startImport}
                disabled={files.length === 0}
                className="flex-1"
              >
                <Upload className="h-4 w-4" />
                Iniciar importação ({files.length})
              </Button>
            </>
          )}

          {phase === "processing" && (
            <div className="flex-1 flex items-center gap-3 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin text-orange-500 shrink-0" />
              <span className="text-sm">
                Processando arquivos... não feche esta janela.
              </span>
            </div>
          )}

          {phase === "done" && (
            <>
              <Button variant="ghost" size="md" onClick={handleReset} className="flex-1 sm:flex-none">
                <RotateCcw className="h-4 w-4" />
                Nova importação
              </Button>
              <Button variant="primary" size="md" onClick={handleClose} className="flex-1">
                Fechar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FileProgressCard({ file, index }: { file: FileItem; index: number }) {
  const statusConfig = {
    Pending: {
      icon: <FileJson className="h-5 w-5 text-slate-400" />,
      label: "Pendente",
      bg: "bg-slate-50",
      border: "border-slate-100",
      text: "text-slate-500",
    },
    Processing: {
      icon: <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />,
      label: "Processando...",
      bg: "bg-orange-50",
      border: "border-orange-100",
      text: "text-orange-600",
    },
    Completed: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      label: "Concluído",
      bg: "bg-green-50",
      border: "border-green-100",
      text: "text-green-600",
    },
    Failed: {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      label: "Falhou",
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-600",
    },
  };

  const config = statusConfig[file.status];

  return (
    <div className={cn("rounded-xl border p-4", config.bg, config.border)}>
      <div className="flex items-center gap-3 mb-2">
        <div className="shrink-0">{config.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-900 text-sm truncate">
            {index}. {file.file.name}
          </p>
          <p className={cn("text-xs font-medium", config.text)}>{config.label}</p>
        </div>
      </div>

      {file.status === "Completed" && (
        <div className="flex flex-wrap gap-3 mt-1 ml-8">
          <span className="text-xs text-slate-500">
            Total: <span className="font-semibold text-slate-700">{file.totalRecords}</span>
          </span>
          <span className="text-xs text-slate-500">
            Criados: <span className="font-semibold text-green-600">{file.createdRecords}</span>
          </span>
          <span className="text-xs text-slate-500">
            Atualizados:{" "}
            <span className="font-semibold text-blue-600">{file.updatedRecords}</span>
          </span>
        </div>
      )}

      {file.status === "Failed" && file.errorMessage && (
        <div className="flex items-start gap-2 mt-2 ml-8">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{file.errorMessage}</p>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color = "slate",
}: {
  label: string;
  value: number;
  color?: "slate" | "green" | "red" | "blue" | "purple";
}) {
  const colorMap = {
    slate: "text-slate-900",
    green: "text-green-600",
    red: "text-red-600",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
      <p className={cn("text-2xl font-black", colorMap[color])}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
