import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNavbar } from "@/components/layout/user-navbar";
import {
  Trophy,
  Target,
  Star,
  Users,
  Zap,
  Clock,
  TrendingUp,
  Flame,
} from "lucide-react";

const placeholderCards = [
  {
    icon: Users,
    title: "Meus Bolões",
    description: "Você ainda não participa de nenhum bolão.",
    value: "0",
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-50 text-blue-500",
    coming: true,
  },
  {
    icon: Clock,
    title: "Próximos Jogos",
    description: "Nenhum jogo programado ainda.",
    value: "—",
    color: "from-green-500 to-green-600",
    iconBg: "bg-green-50 text-green-500",
    coming: true,
  },
  {
    icon: TrendingUp,
    title: "Minha Posição",
    description: "Participe de um bolão para ver seu ranking.",
    value: "—",
    color: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-50 text-purple-500",
    coming: true,
  },
  {
    icon: Star,
    title: "Minhas Conquistas",
    description: "Jogue e ganhe badges exclusivos.",
    value: "0",
    color: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-50 text-amber-500",
    coming: true,
  },
  {
    icon: Target,
    title: "Palpites",
    description: "Você ainda não fez nenhum palpite.",
    value: "0",
    color: "from-red-500 to-red-600",
    iconBg: "bg-red-50 text-red-500",
    coming: true,
  },
  {
    icon: Zap,
    title: "Partida Dobrada",
    description: "Escolha uma partida para valer o dobro.",
    value: "—",
    color: "from-orange-500 to-orange-600",
    iconBg: "bg-orange-50 text-orange-500",
    coming: true,
  },
];

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const firstName = session.user.name?.split(" ")[0] ?? "Jogador";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <UserNavbar
        userName={session.user.name}
        userRole={session.user.role}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {firstName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-sm text-slate-500">
                Bem-vindo ao Paga meu Churrasco
              </p>
            </div>
          </div>
        </div>

        {/* Notice banner */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 mb-6 text-white shadow-lg shadow-orange-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight mb-1">
                Bolões chegando em breve! 🚀
              </h2>
              <p className="text-orange-100 text-sm leading-relaxed">
                Estamos preparando tudo para você! Em breve você poderá criar
                bolões, dar palpites, competir com amigos e ganhar badges
                incríveis. Fique ligado!
              </p>
            </div>
          </div>
        </div>

        {/* Cards grid */}
        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">
          Funcionalidades
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {placeholderCards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.iconBg}`}
              >
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-slate-900">{card.value}</p>
              <p className="font-semibold text-slate-700 text-sm mt-0.5">
                {card.title}
              </p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {card.description}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                <Zap className="h-2.5 w-2.5" />
                Em breve
              </div>
            </div>
          ))}
        </div>

        {/* Trophy section */}
        <div className="mt-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Trophy className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quem vai pagar o churrasco?</h3>
              <p className="text-slate-400 text-sm">
                Você está pronto para o desafio?
              </p>
            </div>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            O bolão vai revelar quem realmente entende de futebol entre seus
            amigos. O perdedor paga o churrasco. 🥩🔥
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Palpites", "Rankings", "Badges", "Dobradinha"].map((tag) => (
              <span
                key={tag}
                className="bg-white/10 text-slate-300 text-xs font-medium px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
