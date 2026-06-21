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

const sections = [
  {
    href: "/admin/teams",
    icon: Flag,
    label: "Seleções",
    key: "teams" as const,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 text-blue-600",
    description: "Gerencie as seleções participantes",
  },
  {
    href: "/admin/players",
    icon: Users,
    label: "Jogadores",
    key: "players" as const,
    color: "bg-green-500",
    lightColor: "bg-green-50 text-green-600",
    description: "Cadastre jogadores das seleções",
  },
  {
    href: "/admin/groups",
    icon: Trophy,
    label: "Grupos",
    key: "groups" as const,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 text-amber-600",
    description: "Organize os grupos do torneio",
  },
  {
    href: "/admin/matches",
    icon: Calendar,
    label: "Partidas",
    key: "matches" as const,
    color: "bg-purple-500",
    lightColor: "bg-purple-50 text-purple-600",
    description: "Agende e gerencie as partidas",
  },
  {
    href: "/admin/stadiums",
    icon: MapPin,
    label: "Estádios",
    key: "stadiums" as const,
    color: "bg-red-500",
    lightColor: "bg-red-50 text-red-600",
    description: "Gerencie os estádios do torneio",
  },
  {
    href: "/admin/badges",
    icon: Star,
    label: "Conquistas",
    key: "badges" as const,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 text-orange-600",
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
          Gerencie todos os dados do torneio
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.lightColor}`}
                >
                  <section.icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-black text-slate-900">
                  {counts[section.key]}
                </span>
              </div>
              <p className="font-semibold text-slate-700 text-sm">
                {section.label}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {section.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick access */}
      <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-3">
        Acesso rápido
      </h2>
      <div className="flex flex-col gap-2">
        {sections.map((section) => (
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
    </div>
  );
}
