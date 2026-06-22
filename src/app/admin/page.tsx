import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Flag,
  Users,
  Trophy,
  Calendar,
  MapPin,
  Star,
  ArrowRight,
  Layers,
  Shuffle,
} from "lucide-react";

async function getCounts() {
  const [teams, players, groups, matches, stadiums, badges] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
    prisma.group.count(),
    prisma.match.count(),
    prisma.stadium.count(),
    prisma.badge.count(),
  ]);
  return { teams, players, groups, matches, stadiums, badges };
}

const activeSections = [
  {
    href: "/admin/teams",
    icon: Flag,
    label: "Seleções",
    key: "teams" as const,
    lightColor: "bg-blue-50 text-blue-600",
    description: "Gerencie as seleções participantes",
  },
  {
    href: "/admin/matches",
    icon: Calendar,
    label: "Partidas",
    key: "matches" as const,
    lightColor: "bg-purple-50 text-purple-600",
    description: "Agende, atualize resultados e gere pontuação",
  },
];

const obsoleteSections = [
  {
    href: "/admin/players",
    icon: Users,
    label: "Jogadores",
    key: "players" as const,
    description: "Cadastre jogadores das seleções",
  },
  {
    href: "/admin/groups",
    icon: Trophy,
    label: "Grupos",
    key: "groups" as const,
    description: "Organize os grupos do torneio",
  },
  {
    href: "/admin/stadiums",
    icon: MapPin,
    label: "Estádios",
    key: "stadiums" as const,
    description: "Gerencie os estádios do torneio",
  },
  {
    href: "/admin/badges",
    icon: Star,
    label: "Conquistas",
    key: "badges" as const,
    description: "Configure badges e conquistas",
  },
];

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">
          Painel Administrativo
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie as partidas e acompanhe o bolão
        </p>
      </div>

      {/* Active sections */}
      <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">
        Acesso rápido
      </h2>
      <div className="flex flex-col gap-2 mb-8">
        {activeSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.lightColor}`}
                >
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{section.label}</p>
                  <p className="text-xs text-slate-400">{section.description}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* Obsolete sections */}
      <h2 className="font-bold text-slate-500 text-sm uppercase tracking-wider mb-3">
        Seções obsoletas
      </h2>
      <div className="flex flex-col gap-2 opacity-50">
        {obsoleteSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <div className="bg-white rounded-2xl px-5 py-4 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-500">
                  <section.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-600">{section.label}</p>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full">
                      OBSOLETO
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{section.description}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-200 group-hover:text-slate-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
