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
      <Loader2 className={cn("animate-spin text-orange-500", sizes[size])} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );
}

export function PageSpinner({ label = "Carregando..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Spinner size="lg" label={label} />
    </div>
  );
}
