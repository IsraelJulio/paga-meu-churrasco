"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

const categories = ["Precisão", "Sequência", "Conquista", "Especial", "Social"];

export default function NewBadgePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", icon: "", category: "", condition: "", points: "10", isActive: "true" });
  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Nome é obrigatório."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/badges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, points: Number(form.points) || 0, isActive: form.isActive === "true", description: form.description || null, icon: form.icon || null, category: form.category || null, condition: form.condition || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Conquista criada!");
      router.push("/admin/badges");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Nova Conquista" description="Crie um badge ou conquista" backHref="/admin/badges" />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome" placeholder="ex: Craque dos Palpites" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <Textarea label="Descrição" placeholder="Descreva como ganhar esta conquista..." value={form.description} onChange={(e) => set("description", e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ícone (emoji)" placeholder="ex: 🏆" value={form.icon} onChange={(e) => set("icon", e.target.value)} maxLength={4} />
            <Select label="Categoria" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">—</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <Input label="Pontos" type="number" min={0} value={form.points} onChange={(e) => set("points", e.target.value)} />
          <Textarea label="Condição (opcional)" placeholder="ex: Acertar 3 placares exatos seguidos" value={form.condition} onChange={(e) => set("condition", e.target.value)} />
          <Select label="Status" value={form.isActive} onChange={(e) => set("isActive", e.target.value)}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </Select>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.push("/admin/badges")} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>Criar conquista</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
