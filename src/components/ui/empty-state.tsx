import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 bg-white/5 border border-orange-500/20 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(249,115,22,0.08)]">
          <Icon
            className="h-8 w-8 text-orange-400"
            style={{ filter: "drop-shadow(0 0 6px rgba(249,115,22,0.5))" }}
          />
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-200 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-5 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
