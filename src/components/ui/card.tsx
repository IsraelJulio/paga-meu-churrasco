import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

function Card({ className, hover, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[#0d0d1e] rounded-2xl border border-orange-500/18 shadow-[0_0_22px_rgba(249,115,22,0.06),inset_0_1px_0_rgba(255,255,255,0.04)]",
        hover &&
          "transition-all duration-200 hover:shadow-[0_0_32px_rgba(249,115,22,0.13)] hover:border-orange-500/38 hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-5 pt-0 flex items-center gap-3",
        className
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold text-slate-100", className)}
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-slate-400 mt-1", className)} {...props} />
  );
}

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };
