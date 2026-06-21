"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl text-orange-500"
        >
          <Flame className="h-6 w-6" />
          <span className="hidden sm:block">Paga meu Churrasco</span>
          <span className="sm:hidden">PMC</span>
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
          className="sm:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-3">
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
