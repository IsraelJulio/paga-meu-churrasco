import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function Spinner({ className, size = "md", label }: SpinnerProps) {
  const sizes = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2
        className={cn("animate-spin text-orange-400", sizes[size])}
        style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.65))" }}
      />
      {label && <p className="text-sm text-slate-400 font-medium">{label}</p>}
    </div>
  );
}

export function PageSpinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060611]">
      <Spinner size="lg" label={label} />
    </div>
  );
}
