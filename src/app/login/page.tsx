"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        login,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Login ou senha incorretos.");
        return;
      }

      toast.success("Bem-vindo de volta! 🔥");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060611] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.03)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* Ambient glow spots */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/6 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.5)] gamer-glow">
              <Flame className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-black font-display text-white tracking-wide">
              Paga meu{" "}
              <span className="text-orange-400">Churrasco</span>
            </h1>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">
            Entre na sua conta para acessar seus bolões
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0d0d1e] border border-orange-500/20 rounded-3xl p-6 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
          <h2 className="text-xl font-black text-slate-100 mb-5 font-display tracking-wide">Entrar</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                label="Login"
                type="text"
                placeholder="Seu login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                autoComplete="username"
              />
              <User className="absolute right-3 top-9 h-4 w-4 text-slate-500" />
            </div>

            <div className="relative">
              <Input
                label="Senha"
                type={showPass ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                error={error}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-9 text-slate-500 hover:text-slate-300 transition-colors"
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
              Entrar
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm text-slate-500">
              Não tem conta?{" "}
              <Link
                href="/register"
                className="text-orange-400 font-semibold hover:text-orange-300 transition-colors"
              >
                Criar agora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
