"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#060611] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

    const variants = {
      primary:
        "bg-orange-500 hover:bg-orange-400 text-white focus:ring-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.65)]",
      secondary:
        "bg-green-600 hover:bg-green-500 text-white focus:ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_22px_rgba(34,197,94,0.5)]",
      danger:
        "bg-red-500 hover:bg-red-400 text-white focus:ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]",
      ghost:
        "bg-transparent hover:bg-white/8 text-slate-300 hover:text-white focus:ring-slate-500 border border-white/10 hover:border-white/20",
      outline:
        "border-2 border-orange-500/70 text-orange-400 hover:bg-orange-500/10 focus:ring-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.15)] hover:shadow-[0_0_18px_rgba(249,115,22,0.3)]",
    };

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-5 text-base",
      lg: "h-13 px-7 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
