"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Menu,
  X,
  Flame,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserNavbarProps {
  userName?: string | null;
  userRole?: string;
}

export function UserNavbar({ userName, userRole }: UserNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#060611]/95 backdrop-blur-md border-b border-orange-500/20 shadow-[0_0_24px_rgba(249,115,22,0.08)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-black text-xl"
        >
          <Flame
            className="h-6 w-6 text-orange-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.7))" }}
          />
          <span className="hidden sm:block font-display text-white tracking-wide">
            Paga meu <span className="text-orange-400">Churrasco</span>
          </span>
          <span className="sm:hidden font-display text-orange-400 tracking-widest text-lg"> Paga meu <span className="text-orange-400">Churrasco</span></span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 text-sm font-medium transition-colors text-slate-300 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          {userRole === "Admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-orange-500/10 text-sm font-medium transition-colors text-orange-400"
            >
              Admin
            </Link>
          )}
          <div className="relative">
            <button
              onClick={() => setUserDropOpen(!userDropOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/8 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_0_10px_rgba(249,115,22,0.5)]">
                {userName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate text-slate-200">
                {userName}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
            {userDropOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[#0d0d1e] border border-orange-500/20 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 text-sm font-medium text-red-400 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden p-2 rounded-xl hover:bg-white/8 text-slate-300"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-orange-500/15 bg-[#060611]/98 px-4 py-4 flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-[0_0_12px_rgba(249,115,22,0.5)]">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{userName}</p>
              <p className="text-xs text-slate-400">{userRole}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-white/8 font-medium text-slate-300 hover:text-white transition-colors"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          {userRole === "Admin" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-orange-500/10 font-medium text-orange-400 transition-colors"
            >
              <User className="h-5 w-5" />
              Painel Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-red-500/10 font-medium text-red-400 mt-2 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
