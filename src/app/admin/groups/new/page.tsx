"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) { toast.error("Nome é obrigatório."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, description: form.description || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Grupo criado!");
      router.push("/admin/groups");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Novo Grupo" description="Crie um grupo para o torneio" backHref="/admin/groups" />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome do grupo" placeholder="ex: Grupo A" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Textarea label="Descrição" placeholder="Descrição opcional..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.push("/admin/groups")} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>Criar grupo</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
