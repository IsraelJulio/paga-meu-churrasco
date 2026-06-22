"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, Flame } from "lucide-react";
import Link from "next/link";

export default function NewPoolPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nome do bolão é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Bolão criado com sucesso!");
      router.push(`/dashboard/pools/${data.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar bolão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar
        userName={session?.user?.name}
        userRole={session?.user?.role as "User" | "Admin" | undefined}
      />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <Link
          href="/dashboard/pools"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-5"
        >
          <ChevronLeft className="h-4 w-4" />
          Meus Bolões
        </Link>

        <div className="mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center mb-3">
            <Flame className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Criar Bolão</h1>
          <p className="text-sm text-slate-500 mt-1">
            Crie seu bolão e convide seus amigos para competir.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
            <Input
              label="Nome do bolão *"
              placeholder="Ex: Bolão dos Brothers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              required
            />
            <Textarea
              label="Descrição (opcional)"
              placeholder="Adicione uma descrição para o bolão..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-700">
            <p className="font-semibold mb-1">Como funciona?</p>
            <ul className="space-y-1 text-amber-600 list-disc list-inside">
              <li>Um código de convite único será gerado</li>
              <li>Compartilhe o código com seus amigos</li>
              <li>Cada um faz seus palpites nas partidas</li>
              <li>O ranking é atualizado automaticamente</li>
            </ul>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Criar Bolão
          </Button>
        </form>
      </main>
    </div>
  );
}
