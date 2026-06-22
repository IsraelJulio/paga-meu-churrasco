"use client";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          "relative z-10 w-full bg-[#0d0d1e] border border-orange-500/20 rounded-t-3xl sm:rounded-2xl shadow-[0_0_40px_rgba(249,115,22,0.12)] max-h-[90vh] overflow-y-auto",
          "sm:max-w-lg",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-5 border-b border-white/8">
            <h2 className="text-lg font-bold text-slate-100">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/8 transition-colors text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
