import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, backHref, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex items-start gap-3">
        {backHref && (
          <Link href={backHref}>
            <button className="mt-1 p-2 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{title}</h1>
          {description && (
            <p className="text-slate-500 text-sm mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
