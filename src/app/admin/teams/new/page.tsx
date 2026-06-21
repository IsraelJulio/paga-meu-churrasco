"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    group: "",
    flagUrl: "",
    primaryColor: "#3b82f6",
    secondaryColor: "#ffffff",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.code) {
      toast.error("Nome e código são obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          group: form.group || null,
          flagUrl: form.flagUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar");
      toast.success("Seleção criada com sucesso!");
      router.push("/admin/teams");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar seleção");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Nova Seleção"
        description="Adicione uma nova seleção ao torneio"
        backHref="/admin/teams"
      />

      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Nome da seleção"
            placeholder="ex: Brasil"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
          <Input
            label="Código (3 letras)"
            placeholder="ex: BRA"
            value={form.code}
            onChange={(e) => set("code", e.target.value.toUpperCase())}
            maxLength={3}
            required
          />
          <Input
            label="Grupo"
            placeholder="ex: A"
            value={form.group}
            onChange={(e) => set("group", e.target.value.toUpperCase())}
            maxLength={1}
          />
          <Input
            label="URL da bandeira"
            type="url"
            placeholder="https://..."
            value={form.flagUrl}
            onChange={(e) => set("flagUrl", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Cor primária
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => set("primaryColor", e.target.value)}
                  className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer p-1"
                />
                <span className="text-sm font-mono text-slate-600">
                  {form.primaryColor}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Cor secundária
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => set("secondaryColor", e.target.value)}
                  className="w-11 h-11 rounded-xl border-2 border-slate-200 cursor-pointer p-1"
                />
                <span className="text-sm font-mono text-slate-600">
                  {form.secondaryColor}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => router.push("/admin/teams")}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>
              Criar seleção
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
