"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserNavbar } from "@/components/layout/user-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ChevronLeft, LogIn } from "lucide-react";
import Link from "next/link";

export default function JoinPoolPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Código de convite é obrigatório");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/pools/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast.info("Você já participa deste bolão!");
        router.push(`/dashboard/pools/${data.poolId}`);
        return;
      }
      if (!res.ok) throw new Error(data.error);
      toast.success(`Bem-vindo ao bolão ${data.pool.name}!`);
      router.push(`/dashboard/pools/${data.pool.id}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar no bolão");
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
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mb-3">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Entrar no Bolão</h1>
          <p className="text-sm text-slate-500 mt-1">
            Insira o código de convite compartilhado com você.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <Input
              label="Código de convite"
              placeholder="Ex: AB3X7K"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={10}
              required
              className="uppercase tracking-widest text-center text-lg font-bold"
            />
          </div>

          <Button type="submit" variant="secondary" size="lg" loading={loading} className="w-full">
            Entrar no Bolão
          </Button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          Não tem um código?{" "}
          <Link href="/dashboard/pools/new" className="text-orange-500 font-semibold">
            Crie seu próprio bolão
          </Link>
        </p>
      </main>
    </div>
  );
}
