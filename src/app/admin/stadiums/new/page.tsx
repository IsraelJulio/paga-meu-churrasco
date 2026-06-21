"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/admin/page-header";
import { toast } from "sonner";

export default function NewStadiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", city: "", country: "", capacity: "", imageUrl: "" });
  function set(field: string, value: string) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.city || !form.country) { toast.error("Nome, cidade e país são obrigatórios."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/stadiums", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, capacity: form.capacity ? Number(form.capacity) : null, imageUrl: form.imageUrl || null }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Estádio criado!");
      router.push("/admin/stadiums");
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Erro"); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <PageHeader title="Novo Estádio" description="Adicione um estádio ao torneio" backHref="/admin/stadiums" />
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm max-w-lg">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Nome do estádio" placeholder="ex: Estádio do Maracanã" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cidade" placeholder="ex: Rio de Janeiro" value={form.city} onChange={(e) => set("city", e.target.value)} required />
            <Input label="País" placeholder="ex: Brasil" value={form.country} onChange={(e) => set("country", e.target.value)} required />
          </div>
          <Input label="Capacidade" type="number" placeholder="ex: 78838" value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
          <Input label="URL da imagem" type="url" placeholder="https://..." value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={() => router.push("/admin/stadiums")} disabled={loading}>Cancelar</Button>
            <Button type="submit" variant="primary" className="flex-1" loading={loading}>Criar estádio</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
