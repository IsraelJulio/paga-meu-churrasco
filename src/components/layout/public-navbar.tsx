"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#060611]/95 backdrop-blur-md border-b border-orange-500/20 shadow-[0_0_24px_rgba(249,115,22,0.08)]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
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

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">
              Criar conta
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 rounded-xl hover:bg-white/8 text-slate-300"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-orange-500/15 bg-[#060611]/98 px-4 py-4 flex flex-col gap-3 animate-fade-in">
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-center">
              Entrar
            </Button>
          </Link>
          <Link href="/register" onClick={() => setOpen(false)}>
            <Button variant="primary" className="w-full justify-center">
              Criar conta
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
