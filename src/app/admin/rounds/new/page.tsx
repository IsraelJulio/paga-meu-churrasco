"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MATCH_PHASE_LABELS } from "@/types";

const phases = ["GroupStage", "RoundOf16", "QuarterFinal", "SemiFinal", "Final"];

export default function NewRoundPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    phase: "GroupStage",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/rounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          phase: form.phase,
          startDate: form.startDate ? new Date(form.startDate) : null,
          endDate: form.endDate ? new Date(form.endDate) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Rodada criada!");
      router.push(`/admin/rounds/${data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar rodada");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Nova Rodada" backHref="/admin/rounds" />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome *"
            placeholder="Ex: Rodada 1 – Fase de Grupos"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Textarea
            label="Descrição"
            placeholder="Descrição opcional..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
          />
          <Select
            label="Fase"
            value={form.phase}
            onChange={(e) => set("phase", e.target.value)}
          >
            {phases.map((p) => (
              <option key={p} value={p}>
                {MATCH_PHASE_LABELS[p as keyof typeof MATCH_PHASE_LABELS] ?? p}
              </option>
            ))}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Início"
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
            <Input
              label="Fim"
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={saving}>
              Criar Rodada
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
