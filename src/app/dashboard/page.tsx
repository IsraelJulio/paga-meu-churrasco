import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserNavbar } from "@/components/layout/user-navbar";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Trophy,
  Target,
  Star,
  Users,
  Zap,
  Clock,
  TrendingUp,
  Flame,
  Plus,
  LogIn,
  ChevronRight,
} from "lucide-react";
import { TeamFlag } from "@/components/ui/team-flag";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] ?? "Jogador";

  const [poolParticipants, nextMatches, allBadgesCount] = await Promise.all([
    prisma.poolParticipant.findMany({
      where: { userId },
      include: {
        pool: {
          select: { id: true, name: true, status: true, _count: { select: { participants: true } } },
        },
      },
      orderBy: { totalPoints: "desc" },
    }),
    prisma.match.findMany({
      where: { status: "Scheduled", matchDate: { gte: new Date() } },
      include: {
        homeTeam: { select: { code: true, name: true, flagUrl: true, primaryColor: true } },
        awayTeam: { select: { code: true, name: true, flagUrl: true, primaryColor: true } },
      },
      orderBy: { matchDate: "asc" },
      take: 3,
    }),
    prisma.badge.count({ where: { isActive: true } }),
  ]);

  const totalPoints = poolParticipants.reduce((s, p) => s + p.totalPoints, 0);
  const totalExact = poolParticipants.reduce((s, p) => s + p.exactScores, 0);

  const earnedBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: { select: { id: true, name: true, icon: true } } },
    orderBy: { earnedAt: "desc" },
    take: 3,
  });

  const activePools = poolParticipants.filter((p) => p.pool.status === "Active");
  const activePoolsCount = activePools.length;

  if (activePoolsCount === 1) {
    redirect(`/dashboard/pools/${activePools[0].pool.id}`);
  }

  return (
    <div className="min-h-screen bg-[#060611] flex flex-col">
      <UserNavbar
        userName={session.user.name}
        userRole={session.user.role}
      />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {/* Welcome */}
        <div className="mb-5 animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-[0_0_12px_rgba(249,115,22,0.5)]">
              {firstName[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-100 font-display tracking-wide">
                Olá, {firstName}!
              </h1>
              <p className="text-sm text-slate-400">
                {activePoolsCount > 0
                  ? `Você está em ${activePoolsCount} bolão${activePoolsCount > 1 ? "ns" : ""} ativo${activePoolsCount > 1 ? "s" : ""}`
                  : "Bem-vindo ao Paga meu Churrasco"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Link href="/dashboard/pools/new">
            <div className="bg-orange-500 rounded-2xl p-4 text-white flex items-center gap-3 hover:bg-orange-400 transition-all active:scale-[0.99] shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Criar Bolão</p>
                <p className="text-orange-200 text-xs">Novo grupo</p>
              </div>
            </div>
          </Link>
          <Link href="/dashboard/pools/join">
            <div className="bg-green-600 rounded-2xl p-4 text-white flex items-center gap-3 hover:bg-green-500 transition-all active:scale-[0.99] shadow-[0_0_18px_rgba(34,197,94,0.25)] hover:shadow-[0_0_28px_rgba(34,197,94,0.4)]">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Entrar</p>
                <p className="text-green-200 text-xs">Com código</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { icon: Users, label: "Meus Bolões", value: poolParticipants.length, iconClass: "text-blue-400", bgClass: "bg-blue-500/10 border-blue-500/20" },
            { icon: Star, label: "Pontos totais", value: totalPoints, iconClass: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" },
            { icon: Target, label: "Placares exatos", value: totalExact, iconClass: "text-red-400", bgClass: "bg-red-500/10 border-red-500/20" },
            { icon: Trophy, label: "Conquistas", value: earnedBadges.length, iconClass: "text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/20" },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#0d0d1e] rounded-2xl p-4 border border-orange-500/15 shadow-[0_0_18px_rgba(249,115,22,0.05)]">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 border ${stat.bgClass}`}>
                <stat.icon className={`h-4 w-4 ${stat.iconClass}`} />
              </div>
              <p className="text-2xl font-black text-white font-display">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* My pools */}
        {poolParticipants.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-200 font-display tracking-wide">Meus Bolões</h2>
              <Link href="/dashboard/pools" className="text-orange-400 text-sm font-semibold hover:text-orange-300 transition-colors">
                Ver todos
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {poolParticipants.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/dashboard/pools/${p.pool.id}`}>
                  <div className="bg-[#0d0d1e] rounded-2xl p-4 border border-orange-500/15 flex items-center justify-between hover:border-orange-500/35 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-500/15 border border-orange-500/25 rounded-xl flex items-center justify-center">
                        <Flame className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-100 text-sm">{p.pool.name}</p>
                        <p className="text-xs text-slate-500">
                          {p.pool._count.participants} participante{p.pool._count.participants !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-black text-white font-display">{p.totalPoints}</div>
                        <div className="text-xs text-slate-500">pts</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Next matches */}
        {nextMatches.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-500" />
              <h2 className="font-bold text-slate-200 font-display tracking-wide">Próximas Partidas</h2>
            </div>
            <div className="flex flex-col gap-2">
              {nextMatches.map((m) => (
                <div key={m.id} className="bg-[#0d0d1e] rounded-2xl p-4 border border-orange-500/15">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <TeamFlag flagUrl={m.homeTeam.flagUrl} code={m.homeTeam.code} primaryColor={m.homeTeam.primaryColor} size="sm" />
                        <span className="font-black text-slate-100">{m.homeTeam.code}</span>
                      </div>
                      <span className="text-slate-500 text-sm font-bold">vs</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-slate-100">{m.awayTeam.code}</span>
                        <TeamFlag flagUrl={m.awayTeam.flagUrl} code={m.awayTeam.code} primaryColor={m.awayTeam.primaryColor} size="sm" />
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(m.matchDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent badges */}
        {earnedBadges.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }} />
              <h2 className="font-bold text-slate-200 font-display tracking-wide">Conquistas Recentes</h2>
            </div>
            <div className="flex gap-3">
              {earnedBadges.map((ub) => (
                <div key={ub.id} className="bg-[#0d0d1e] rounded-2xl p-3 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.06)] text-center flex-1">
                  <div className="text-2xl mb-1">{ub.badge.icon ?? "🏅"}</div>
                  <p className="text-xs font-semibold text-slate-300">{ub.badge.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for new users */}
        {poolParticipants.length === 0 && (
          <div className="bg-[#0d0d1e] border border-orange-500/25 rounded-2xl p-5 shadow-[0_0_30px_rgba(249,115,22,0.08)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-400" style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.5))" }} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100 font-display">Quem vai pagar o churrasco?</h3>
                <p className="text-slate-400 text-sm">Crie ou entre em um bolão!</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Faça palpites, escolha partidas para dobrar a pontuação, ganhe badges e veja quem realmente entende de futebol!
            </p>
            <div className="flex flex-wrap gap-2">
              {["Palpites", "Rankings", "Badges", "Vale o Dobro"].map((tag) => (
                <span key={tag} className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats highlight */}
        {totalPoints > 0 && (
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl p-4 mt-4 text-white shadow-[0_0_25px_rgba(249,115,22,0.35)]">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-bold text-sm">Resumo geral</span>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-2xl font-black font-display">{totalPoints}</span>
                <span className="text-orange-200 text-sm ml-1">pts totais</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="text-2xl font-black font-display">{totalExact}</span>
                <span className="text-orange-200 text-sm ml-1">placares exatos</span>
              </div>
            </div>
          </div>
        )}

        {/* Available badges hint */}
        {earnedBadges.length === 0 && allBadgesCount > 0 && (
          <div className="mt-4 bg-[#0d0d1e] rounded-2xl p-4 border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(245,158,11,0.5))" }} />
              <p className="text-sm font-semibold text-slate-100">
                {allBadgesCount} conquistas para desbloquear!
              </p>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Faça palpites e acerte resultados para ganhar badges exclusivas.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
