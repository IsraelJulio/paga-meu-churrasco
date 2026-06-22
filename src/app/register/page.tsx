"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, login, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
        return;
      }

      toast.success("Conta criada! Bem-vindo ao bolão! 🔥");

      const result = await signIn("credentials", {
        login,
        password,
        redirect: false,
      });

      if (result?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">
              Paga meu{" "}
              <span className="text-orange-400">Churrasco</span>
            </h1>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">
            Crie sua conta e entre no bolão!
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-xl font-black text-slate-900 mb-5">
            Criar conta
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                label="Seu nome"
                type="text"
                placeholder="Como você quer ser chamado"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <User className="absolute right-3 top-9 h-4 w-4 text-slate-400" />
            </div>

            <div className="relative">
              <Input
                label="Login"
                type="text"
                placeholder="Escolha seu login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
              />
              <User className="absolute right-3 top-9 h-4 w-4 text-slate-400" />
            </div>

            <div className="relative">
              <Input
                label="Senha"
                type={showPass ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                error={error}
                hint="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-1"
            >
              <Flame className="h-5 w-5" />
              Criar conta grátis
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-orange-500 font-semibold hover:underline"
              >
                Entrar agora
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-sm mt-4">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            ← Voltar para o início
          </Link>
        </p>
      </div>
    </div>
  );
}
