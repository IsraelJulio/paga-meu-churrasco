"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Flag,
  Users,
  Trophy,
  Calendar,
  MapPin,
  Star,
  Upload,
  LogOut,
  Flame,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/teams", icon: Flag, label: "Seleções" },
  { href: "/admin/players", icon: Users, label: "Jogadores" },
  { href: "/admin/groups", icon: Trophy, label: "Grupos" },
  { href: "/admin/matches", icon: Calendar, label: "Partidas" },
  { href: "/admin/stadiums", icon: MapPin, label: "Estádios" },
  { href: "/admin/badges", icon: Star, label: "Conquistas" },
  { href: "/admin/imports", icon: Upload, label: "Importações" },
];

interface AdminSidebarProps {
  userName?: string | null;
}

export function AdminSidebar({ userName }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex flex-col h-full bg-slate-900 text-white">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center">
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-black text-sm leading-tight">Paga meu</p>
            <p className="font-black text-sm leading-tight text-orange-400">
              Churrasco
            </p>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            {userName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-orange-400 font-medium">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-500 px-3 mb-2 mt-1 uppercase tracking-wider">
          Menu
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors",
              isActive(item.href, item.exact)
                ? "bg-orange-500 text-white shadow-sm"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Home className="h-5 w-5 shrink-0" />
          Área do usuário
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  );
}
