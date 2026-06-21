import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Star,
  Zap,
  Target,
  Award,
  Flame,
  ChevronRight,
  Swords,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Bolões entre amigos",
    description:
      "Crie grupos privados e convide seus amigos para competir em bolões exclusivos.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Target,
    title: "Palpites nas partidas",
    description:
      "Dê seu palpite no placar de cada jogo e ganhe pontos pela precisão.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Trophy,
    title: "Ranking em tempo real",
    description:
      "Acompanhe sua posição no ranking geral e entre seus amigos a cada rodada.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Award,
    title: "Conquistas e badges",
    description:
      "Ganhe badges especiais por seus desempenhos e mostre para os amigos.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Zap,
    title: "Partida valendo o dobro",
    description:
      "Escolha uma partida especial onde seus pontos valem em dobro. Use com sabedoria!",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Swords,
    title: "Desafios especiais",
    description:
      "Desafios semanais e torneios relâmpago para os mais competitivos.",
    color: "bg-red-50 text-red-600",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-orange-300 text-sm font-semibold mb-6">
            <Flame className="h-4 w-4" />
            Bolão da Copa
          </div>

          <h1 className="text-4xl sm:text-6xl font-black leading-tight mb-4">
            Paga meu{" "}
            <span className="text-orange-400">Churrasco</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-300 font-medium mb-4">
            🏆 Crie seu bolão, desafie seus amigos e{" "}
            <br className="hidden sm:block" />
            descubra quem entende mesmo de futebol.
          </p>

          <p className="text-slate-400 text-base sm:text-lg mb-10 max-w-2xl mx-auto">
            Uma plataforma de bolão entre amigos, completamente gratuita, sem
            dinheiro real. Só diversão, zoeira saudável e competição.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 h-14 rounded-2xl shadow-lg shadow-orange-500/30"
              >
                <Flame className="h-5 w-5" />
                Criar conta grátis
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-8 h-14 rounded-2xl border-2 border-white/30 text-white bg-transparent hover:bg-white/10"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-slate-400 text-sm flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              100% gratuito
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              Sem dinheiro real
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              Só diversão
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-20 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Como vai funcionar?
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Estamos construindo a melhor plataforma de bolão entre amigos. Veja
            o que está chegando em breve.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}
              >
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-3 inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                <Zap className="h-3 w-3" />
                Em breve
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-3xl mx-auto px-4 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-3">
            🔥 Pronto para o bolão?
          </h2>
          <p className="text-orange-100 mb-8 text-lg">
            Crie sua conta agora e seja o primeiro a testar quando lançarmos os
            bolões!
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="bg-white text-orange-600 hover:bg-orange-50 h-14 px-10 text-lg rounded-2xl font-bold shadow-lg"
            >
              <Flame className="h-5 w-5" />
              Criar minha conta
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 text-sm">
        <p className="flex items-center justify-center gap-1.5 font-medium">
          <Flame className="h-4 w-4 text-orange-400" />
          Paga meu Churrasco — Feito com 🔥 para os amantes de futebol
        </p>
        <p className="mt-2 text-xs text-slate-600">
          Plataforma independente. Sem vínculo com nenhuma entidade oficial de
          futebol.
        </p>
      </footer>
    </div>
  );
}
