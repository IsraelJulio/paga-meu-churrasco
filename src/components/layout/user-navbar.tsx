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
    <nav className="sticky top-0 z-40 bg-slate-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-black text-xl text-orange-400"
        >
          <Flame className="h-6 w-6" />
          <span className="hidden sm:block">Paga meu Churrasco</span>
          <span className="sm:hidden">PMC</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          {userRole === "Admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors text-orange-400"
            >
              Admin
            </Link>
          )}
          <div className="relative">
            <button
              onClick={() => setUserDropOpen(!userDropOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                {userName?.[0]?.toUpperCase() ?? "U"}
              </div>
              <span className="text-sm font-medium max-w-[100px] truncate">
                {userName}
              </span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {userDropOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 text-slate-700 overflow-hidden">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-50 text-sm font-medium text-red-500"
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
          className="sm:hidden p-2 rounded-xl hover:bg-white/10"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-slate-900 px-4 py-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
              {userName?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div>
              <p className="font-semibold">{userName}</p>
              <p className="text-xs text-slate-400">{userRole}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-white/10 font-medium"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          {userRole === "Admin" && (
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-white/10 font-medium text-orange-400"
            >
              <User className="h-5 w-5" />
              Painel Admin
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-white/10 font-medium text-red-400 mt-2"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}
