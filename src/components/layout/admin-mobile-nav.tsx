"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { href: "/admin/teams", icon: Flag, label: "Seleções" },
  { href: "/admin/matches", icon: Calendar, label: "Partidas" },
  { href: "/admin/players", icon: Users, label: "Jogadores", obsolete: true },
  { href: "/admin/groups", icon: Trophy, label: "Grupos", obsolete: true },
  { href: "/admin/stadiums", icon: MapPin, label: "Estádios", obsolete: true },
  { href: "/admin/badges", icon: Star, label: "Conquistas", obsolete: true },
  { href: "/admin/imports", icon: Upload, label: "Importações", obsolete: true },
];

interface AdminMobileNavProps {
  userName?: string | null;
}

export function AdminMobileNav({ userName }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 text-white h-16 flex items-center justify-between px-4 shadow-lg">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-orange-400">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
            {userName?.[0]?.toUpperCase() ?? "A"}
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl hover:bg-white/10"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-72 bg-slate-900 text-white flex flex-col h-full shadow-2xl">
            <div className="p-5 border-b border-white/10">
              <p className="font-semibold">{userName}</p>
              <p className="text-xs text-orange-400">Administrador</p>
            </div>
            <nav className="flex-1 p-3 overflow-y-auto">
              {navItems.filter((i) => !i.obsolete).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm font-medium transition-colors",
                    isActive(item.href, item.exact)
                      ? "bg-orange-500 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              ))}
              <p className="text-xs font-semibold text-slate-600 px-3 mb-2 mt-4 uppercase tracking-wider">
                Obsoleto
              </p>
              {navItems.filter((i) => i.obsolete).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl mb-1 text-sm font-medium transition-colors opacity-50",
                    isActive(item.href, item.exact)
                      ? "bg-slate-600 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-300"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-[10px] font-bold bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">
                    OBSOLETO
                  </span>
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t border-white/10">
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 mb-1"
              >
                <Home className="h-5 w-5" />
                Área do usuário
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
